import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOrderDto } from './dto';
import { ALMATY, distanceMeters, specialistPassesFilters, type OrderFilters } from './geo';

const NEW_WINDOW_MS = 60 * 1000; // С-03: «Новые» младше 1 минуты

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertNotBlocked(userId: string) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (u.blockedAt) throw new ForbiddenException(u.blockedReason || 'user_blocked'); // СП-09
    return u;
  }

  /** S-20: создание заказа заказчиком → active. */
  async create(userId: string, dto: CreateOrderDto) {
    await this.assertNotBlocked(userId);
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!cat || cat.status !== 'approved') throw new BadRequestException('invalid_category');

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { isClient: true } });
      return tx.order.create({
        data: {
          clientId: userId,
          categoryId: dto.categoryId,
          title: dto.title,
          description: dto.description,
          photos: dto.photos ?? [],
          budget: dto.budget,
          address: dto.address,
          lat: dto.lat,
          lng: dto.lng,
          filters: (dto.filters ?? {}) as object,
        },
      });
    });
    return this.serialize(order);
  }

  /** История заказов заказчика (ИЗ-02). */
  async myOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true, _count: { select: { bids: true } } },
    });
    return orders.map((o) => ({ ...this.serialize(o), bids_count: o._count.bids }));
  }

  /**
   * Лента специалиста (S-11): active-заказы в его категориях, проходящие фильтры (Ф-07),
   * не скрытые свайпом, не свои. С расстоянием и флагом «Новый» (<1 мин). Сортировка по расстоянию.
   */
  async feed(userId: string, lat?: number, lng?: number) {
    const profile = await this.prisma.specialistProfile.findUnique({
      where: { userId },
      include: { categories: true },
    });
    if (!profile) throw new BadRequestException('specialist_profile_required');

    const catIds = profile.categories.map((c) => c.categoryId);
    if (profile.mainCategoryId) catIds.push(profile.mainCategoryId);
    if (catIds.length === 0) return [];

    const hidden = await this.prisma.hiddenOrder.findMany({
      where: { specialistId: profile.id },
      select: { orderId: true },
    });
    const hiddenIds = new Set(hidden.map((h) => h.orderId));

    const candidates = await this.prisma.order.findMany({
      where: {
        status: 'active',
        categoryId: { in: Array.from(new Set(catIds)) },
        clientId: { not: userId },
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    const me = lat != null && lng != null ? { lat, lng } : ALMATY;
    const spec = {
      diplomaApproved: profile.diplomaStatus === 'approved',
      rating: profile.rating,
      completedOrders: profile.completedOrdersCount,
    };

    const result = candidates
      .filter((o) => !hiddenIds.has(o.id))
      .map((o) => {
        const dist = o.lat != null && o.lng != null ? distanceMeters(me, { lat: o.lat, lng: o.lng }) : null;
        return { o, dist };
      })
      .filter(({ o, dist }) => specialistPassesFilters(o.filters as OrderFilters, spec, dist)) // Ф-07
      .sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity))
      .map(({ o, dist }) => ({
        ...this.serialize(o),
        distance_m: dist,
        is_new: Date.now() - o.createdAt.getTime() < NEW_WINDOW_MS, // С-03
      }));

    return result;
  }

  async getOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { category: true } });
    if (!order) throw new NotFoundException('order_not_found');
    return this.serialize(order);
  }

  /** Свайп влево (S-11): скрыть заказ у специалиста. */
  async hide(userId: string, orderId: string) {
    const profile = await this.prisma.specialistProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('specialist_profile_required');
    await this.prisma.hiddenOrder.upsert({
      where: { specialistId_orderId: { specialistId: profile.id, orderId } },
      create: { specialistId: profile.id, orderId },
      update: {},
    });
    return { ok: true };
  }

  private serialize(o: {
    id: string;
    clientId: string;
    categoryId: string;
    title: string;
    description: string;
    photos: string[];
    budget: number;
    address: string;
    lat: number | null;
    lng: number | null;
    status: string;
    filters: unknown;
    acceptedBidId: string | null;
    createdAt: Date;
    category?: { name: string } | null;
  }) {
    return {
      id: o.id,
      client_id: o.clientId,
      category_id: o.categoryId,
      category_name: o.category?.name ?? null,
      title: o.title,
      description: o.description,
      photos: o.photos,
      budget: o.budget,
      address: o.address,
      lat: o.lat,
      lng: o.lng,
      status: o.status,
      filters: o.filters,
      accepted_bid_id: o.acceptedBidId,
      created_at: o.createdAt.toISOString(),
    };
  }
}
