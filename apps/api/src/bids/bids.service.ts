import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BidStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PUSH_PROVIDER, type PushProvider } from '../integrations/tokens';
import type { CreateBidDto } from './dto';

// «Проигравшие» при закрытии сделки — активные отклики, кроме принятого (в т.ч. с контрофером).
const LOSER_STATUSES: BidStatus[] = ['pending', 'countered'];

/**
 * Скрывает телефоны / ссылки / мессенджеры в тексте отклика — анти-спам, сделки остаются
 * на платформе (специалисты не уводят клиента в обход). Возвращает null для пустого текста.
 */
function maskContacts(text?: string | null): string | null {
  const v = text?.trim();
  if (!v) return null;
  const masked = v
    // Телефоны: маскируем длинную числовую последовательность только если в ней ≥10 цифр
    // (реальный номер), чтобы не трогать годы/диапазоны/измерения («2015-2020», «200 300»).
    .replace(/\+?\d[\d\s().-]{6,}\d/g, (m) => (m.replace(/\D/g, '').length >= 10 ? '•••' : m))
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, '•••') // ссылки
    .replace(/@[a-zа-я0-9_]{3,}/gi, '•••') // @ники
    .replace(/\b(?:whats?app|вотсап|ватсап|telegram|телеграм|тг|viber|вайбер|instagram|инста|инстаграм)\b/gi, '•••')
    .trim();
  return masked || null;
}

@Injectable()
export class BidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
  ) {}

  private commissionPct(): number {
    return Number(this.config.get('ORDER_COMMISSION_PCT') ?? 5);
  }

  /** S-13: специалист откликается. Требует верификацию (В-06). Комиссия считается заранее для показа. */
  async create(userId: string, orderId: string, dto: CreateBidDto) {
    const { price, availability, hasMaterials, comment } = dto;
    const profile = await this.prisma.specialistProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('specialist_profile_required');
    if (profile.verificationStatus !== 'approved') throw new ForbiddenException('not_verified'); // В-06

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'active') throw new BadRequestException('order_not_active');
    if (order.clientId === userId) throw new BadRequestException('own_order');

    // БП-02, S-17: новые отклики блокируются при неактивной подписке (Б-01).
    const canBid =
      profile.subscriptionActive ||
      (profile.subscriptionFreeUntil != null && profile.subscriptionFreeUntil > new Date());
    if (!canBid) throw new ForbiddenException('subscription_inactive');

    const commission = Math.round((price * this.commissionPct()) / 100);
    // Структурные поля не передали (напр. «перебить» встречную одной ценой) — в UPDATE их НЕ трогаем,
    // чтобы re-counter не обнулял ранее указанные готовность/материалы/питч (сравнимость S-23).
    const structuredUpdate: Record<string, unknown> = {};
    if (availability !== undefined) structuredUpdate.availability = availability;
    if (hasMaterials !== undefined) structuredUpdate.hasMaterials = hasMaterials;
    if (comment !== undefined) structuredUpdate.comment = maskContacts(comment); // анти-спам, на платформе

    const bid = await this.prisma.bid.upsert({
      where: { orderId_specialistId: { orderId, specialistId: profile.id } },
      create: {
        orderId,
        specialistId: profile.id,
        price,
        commission,
        status: 'pending',
        availability: availability ?? null,
        hasMaterials: hasMaterials ?? null,
        comment: maskContacts(comment),
      },
      // Повторный отклик (в т.ч. «перебить» встречную цену) — сбрасываем контрофер и статус в pending.
      update: { price, commission, status: 'pending', counterPrice: null, ...structuredUpdate },
    });

    // Стрик: день с ≥1 откликом (§10 бизнес-правил).
    await this.bumpStreak(profile.id);

    // Push заказчику
    await this.push.send(order.clientId, {
      type: 'new_bid',
      title: 'Новый отклик на заказ',
      body: order.title,
      payload: { route: `/client/orders/${orderId}/bids` },
    });

    return this.serializeBid(bid);
  }

  /**
   * S-24: заказчик принимает отклик по исходной цене. Требует статус pending.
   */
  async accept(userId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { order: true, specialist: true },
    });
    if (!bid) throw new NotFoundException('bid_not_found');
    if (bid.order.clientId !== userId) throw new ForbiddenException('not_your_order');
    if (bid.order.status !== 'active') throw new BadRequestException('order_not_active');
    if (bid.status !== 'pending') throw new BadRequestException('bid_not_pending');
    return this.closeDeal(bid, bid.price);
  }

  /**
   * G6: заказчик предлагает встречную цену на pending-отклик (round-trip).
   * bid→countered + counterPrice, push специалисту. Специалист отвечает
   * acceptCounter (принять) или новым откликом create (перебить свою цену).
   */
  async counter(userId: string, bidId: string, price: number) {
    if (!Number.isInteger(price) || price <= 0) throw new BadRequestException('invalid_price');
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { order: true, specialist: true },
    });
    if (!bid) throw new NotFoundException('bid_not_found');
    if (bid.order.clientId !== userId) throw new ForbiddenException('not_your_order');
    if (bid.order.status !== 'active') throw new BadRequestException('order_not_active');
    if (bid.status !== 'pending') throw new BadRequestException('bid_not_pending');

    // Атомарный переход pending→countered: гонка «accept + counter» не должна перезаписать
    // уже принятый отклик (guard в самом UPDATE, а не только в прочитанном ранее статусе).
    const res = await this.prisma.bid.updateMany({
      where: { id: bidId, status: 'pending' },
      data: { status: 'countered', counterPrice: price },
    });
    if (res.count === 0) throw new BadRequestException('bid_not_pending');

    await this.push.send(bid.specialist.userId, {
      type: 'bid_countered',
      title: 'Встречное предложение по цене',
      body: bid.order.title,
      payload: { route: `/sp/bids?tab=pending` },
    });
    const updated = await this.prisma.bid.findUnique({ where: { id: bidId } });
    return this.serializeBid(updated!);
  }

  /**
   * G6: специалист принимает встречную цену заказчика → сделка закрывается по counterPrice.
   */
  async acceptCounter(userId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { order: true, specialist: true },
    });
    if (!bid) throw new NotFoundException('bid_not_found');
    if (bid.specialist.userId !== userId) throw new ForbiddenException('not_your_bid');
    if (bid.status !== 'countered' || bid.counterPrice == null) throw new BadRequestException('no_counter');
    if (bid.order.status !== 'active') throw new BadRequestException('order_not_active');
    return this.closeDeal(bid, bid.counterPrice);
  }

  /**
   * Закрытие сделки по финальной цене (ADR-001): bid→accepted (цена/комиссия пересчитаны от
   * finalPrice), прочие pending/countered→not_selected (+push), заказ→in_progress, чат, комиссия.
   * Общая логика для accept (по исходной цене) и acceptCounter (по встречной).
   */
  private async closeDeal(
    bid: {
      id: string;
      orderId: string;
      specialistId: string;
      order: { title: string };
      specialist: { userId: string; balance: number };
    },
    finalPrice: number,
  ) {
    const commission = Math.round((finalPrice * this.commissionPct()) / 100);
    const newBalance = bid.specialist.balance - commission;

    const others = await this.prisma.bid.findMany({
      where: { orderId: bid.orderId, status: { in: LOSER_STATUSES }, id: { not: bid.id } },
      include: { specialist: true },
    });

    await this.prisma.$transaction([
      this.prisma.bid.update({
        where: { id: bid.id },
        data: { status: 'accepted', price: finalPrice, counterPrice: null, commission },
      }),
      this.prisma.bid.updateMany({
        where: { orderId: bid.orderId, status: { in: LOSER_STATUSES }, id: { not: bid.id } },
        data: { status: 'not_selected' },
      }),
      this.prisma.order.update({
        where: { id: bid.orderId },
        data: { status: 'in_progress', acceptedBidId: bid.id },
      }),
      this.prisma.chat.create({ data: { orderId: bid.orderId } }),
      ...(commission > 0
        ? [
            this.prisma.specialistProfile.update({
              where: { id: bid.specialistId },
              data: { balance: newBalance },
            }),
            this.prisma.transaction.create({
              data: {
                userId: bid.specialist.userId,
                type: 'commission',
                amount: -commission,
                balanceAfter: newBalance,
                meta: { orderId: bid.orderId, bidId: bid.id },
              },
            }),
          ]
        : []),
    ]);

    await this.push.send(bid.specialist.userId, {
      type: 'bid_accepted',
      title: 'Заказ принят',
      body: bid.order.title,
      payload: { route: `/chat/${bid.orderId}` },
    });
    await Promise.all(
      others.map((o) =>
        this.push.send(o.specialist.userId, {
          type: 'bid_not_selected',
          title: 'Заказчик выбрал другого специалиста',
          body: bid.order.title,
          payload: { route: `/sp/bids?tab=archive` },
        }),
      ),
    );

    return { ok: true, cascaded: others.length };
  }

  /** Заказчик отклоняет отдельный отклик (S-24). Только активный отклик (pending/countered) —
   *  нельзя «отклонить» уже принятую сделку (иначе заказ повиснет: acceptedBid=declined). */
  async decline(userId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({ where: { id: bidId }, include: { order: true } });
    if (!bid) throw new NotFoundException('bid_not_found');
    if (bid.order.clientId !== userId) throw new ForbiddenException('not_your_order');
    const res = await this.prisma.bid.updateMany({
      where: { id: bidId, status: { in: ['pending', 'countered'] } },
      data: { status: 'declined' },
    });
    if (res.count === 0) throw new BadRequestException('bid_not_pending');
    return { ok: true };
  }

  /** S-14: отклики специалиста. */
  async myBids(userId: string) {
    const profile = await this.prisma.specialistProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    const bids = await this.prisma.bid.findMany({
      where: { specialistId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { order: { include: { category: true } } },
    });
    return bids.map((b) => ({
      ...this.serializeBid(b),
      order: { id: b.order.id, title: b.order.title, budget: b.order.budget, status: b.order.status },
    }));
  }

  /** S-23: отклики на заказ (для заказчика) с профилем специалиста. */
  async orderBids(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('order_not_found');
    if (order.clientId !== userId) throw new ForbiddenException('not_your_order');

    const bids = await this.prisma.bid.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: { specialist: { include: { user: true } } },
    });
    return bids.map((b) => ({
      id: b.id,
      price: b.price,
      counter_price: b.counterPrice,
      status: b.status,
      availability: b.availability,
      has_materials: b.hasMaterials,
      comment: b.comment,
      specialist: {
        id: b.specialist.id,
        name: b.specialist.user.name,
        rating: b.specialist.rating,
        completed_orders: b.specialist.completedOrdersCount,
        diploma: b.specialist.diplomaStatus === 'approved',
        about: b.specialist.about,
      },
    }));
  }

  private async bumpStreak(profileId: string) {
    const p = await this.prisma.specialistProfile.findUnique({ where: { id: profileId } });
    if (!p) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = p.streakLastDate ? new Date(p.streakLastDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    let streakDays = p.streakDays;
    if (!last || last.getTime() < today.getTime() - 86400000) streakDays = 1;
    else if (last.getTime() === today.getTime() - 86400000) streakDays = p.streakDays + 1;
    else return; // уже сегодня

    await this.prisma.specialistProfile.update({
      where: { id: profileId },
      data: { streakDays, streakLastDate: today },
    });
  }

  private serializeBid(b: {
    id: string;
    orderId: string;
    price: number;
    counterPrice?: number | null;
    commission: number;
    status: string;
    availability?: string | null;
    hasMaterials?: boolean | null;
    comment?: string | null;
  }) {
    return {
      id: b.id,
      order_id: b.orderId,
      price: b.price,
      counter_price: b.counterPrice ?? null,
      commission: b.commission,
      payout: b.price - b.commission,
      status: b.status,
      availability: b.availability ?? null,
      has_materials: b.hasMaterials ?? null,
      comment: b.comment ?? null,
    };
  }
}
