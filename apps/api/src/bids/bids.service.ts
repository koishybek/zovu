import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PUSH_PROVIDER, type PushProvider } from '../integrations/tokens';
import type { CreateBidDto } from './dto';

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
    const structured = {
      availability: availability ?? null,
      hasMaterials: hasMaterials ?? null,
      comment: comment?.trim() || null,
    };

    const bid = await this.prisma.bid.upsert({
      where: { orderId_specialistId: { orderId, specialistId: profile.id } },
      create: { orderId, specialistId: profile.id, price, commission, status: 'pending', ...structured },
      update: { price, commission, status: 'pending', ...structured },
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
   * S-24: заказчик принимает отклик. КАСКАД:
   * bid→accepted, прочие pending→not_selected (+push), заказ→in_progress, создаётся чат,
   * комиссия списывается с баланса специалиста (ADR-001, баланс может уйти в минус).
   */
  async accept(userId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { order: true, specialist: true },
    });
    if (!bid) throw new NotFoundException('bid_not_found');
    if (bid.order.clientId !== userId) throw new ForbiddenException('not_your_order');
    if (bid.order.status !== 'active') throw new BadRequestException('order_not_active');

    const others = await this.prisma.bid.findMany({
      where: { orderId: bid.orderId, status: 'pending', id: { not: bidId } },
      include: { specialist: true },
    });

    const newBalance = bid.specialist.balance - bid.commission;

    await this.prisma.$transaction([
      this.prisma.bid.update({ where: { id: bidId }, data: { status: 'accepted' } }),
      this.prisma.bid.updateMany({
        where: { orderId: bid.orderId, status: 'pending', id: { not: bidId } },
        data: { status: 'not_selected' },
      }),
      this.prisma.order.update({
        where: { id: bid.orderId },
        data: { status: 'in_progress', acceptedBidId: bidId },
      }),
      this.prisma.chat.create({ data: { orderId: bid.orderId } }),
      // Комиссия (ADR-001) — списание в момент принятия
      ...(bid.commission > 0
        ? [
            this.prisma.specialistProfile.update({
              where: { id: bid.specialistId },
              data: { balance: newBalance },
            }),
            this.prisma.transaction.create({
              data: {
                userId: bid.specialist.userId,
                type: 'commission',
                amount: -bid.commission,
                balanceAfter: newBalance,
                meta: { orderId: bid.orderId, bidId },
              },
            }),
          ]
        : []),
    ]);

    // Push: принятому + каждому «не выбранному» (каскад)
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
          payload: { route: `/sp/bids` },
        }),
      ),
    );

    return { ok: true, cascaded: others.length };
  }

  /** Заказчик отклоняет отдельный отклик (S-24). */
  async decline(userId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({ where: { id: bidId }, include: { order: true } });
    if (!bid) throw new NotFoundException('bid_not_found');
    if (bid.order.clientId !== userId) throw new ForbiddenException('not_your_order');
    await this.prisma.bid.update({ where: { id: bidId }, data: { status: 'declined' } });
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
      commission: b.commission,
      payout: b.price - b.commission,
      status: b.status,
      availability: b.availability ?? null,
      has_materials: b.hasMaterials ?? null,
      comment: b.comment ?? null,
    };
  }
}
