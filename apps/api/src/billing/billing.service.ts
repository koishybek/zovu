import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
  PUSH_PROVIDER,
  type PushProvider,
} from '../integrations/tokens';

@Injectable()
export class BillingService {
  private readonly logger = new Logger('Billing');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(PAYMENT_PROVIDER) private readonly payment: PaymentProvider,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
  ) {}

  private price(): number {
    return Number(this.config.get('SUBSCRIPTION_PRICE') ?? 100);
  }

  /** Может ли специалист отправлять новые отклики (Б-01, БП-02): активная подписка или бонус-период. */
  static canBid(p: { subscriptionActive: boolean; subscriptionFreeUntil: Date | null }, now = new Date()): boolean {
    return p.subscriptionActive || (p.subscriptionFreeUntil != null && p.subscriptionFreeUntil > now);
  }

  async getBalance(userId: string) {
    const p = await this.prisma.specialistProfile.findUnique({ where: { userId } });
    if (!p) throw new BadRequestException('specialist_profile_required');
    const nextCharge = new Date();
    nextCharge.setHours(24, 0, 0, 0); // ближайшая полночь
    return {
      balance: p.balance,
      subscription_active: p.subscriptionActive,
      subscription_free_until: p.subscriptionFreeUntil?.toISOString() ?? null,
      subscription_price: this.price(),
      next_charge_date: p.subscriptionActive ? nextCharge.toISOString() : null,
      can_bid: BillingService.canBid(p),
    };
  }

  async getTransactions(userId: string) {
    const rows = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      balance_after: r.balanceAfter,
      created_at: r.createdAt.toISOString(),
    }));
  }

  /**
   * S-16 пополнение (мок). БП-07: если подписка была неактивна и после пополнения
   * balance ≥ price → немедленное списание price и активация подписки.
   */
  async topup(userId: string, amount: number, method: string) {
    if (amount <= 0) throw new BadRequestException('invalid_amount');
    const p = await this.prisma.specialistProfile.findUnique({ where: { userId } });
    if (!p) throw new BadRequestException('specialist_profile_required');

    const res = await this.payment.topup(userId, amount, method);
    if (!res.ok) throw new BadRequestException('payment_failed');

    await this.prisma.$transaction(async (tx) => {
      let balance = p.balance + amount;
      await tx.transaction.create({
        data: { userId, type: 'topup', amount, balanceAfter: balance, meta: { method } },
      });

      let subscriptionActive = p.subscriptionActive;
      if (!p.subscriptionActive && balance >= this.price()) {
        balance -= this.price();
        subscriptionActive = true;
        await tx.transaction.create({
          data: { userId, type: 'subscription', amount: -this.price(), balanceAfter: balance, meta: { reason: 'activation' } },
        });
      }

      await tx.specialistProfile.update({
        where: { id: p.id },
        data: { balance, subscriptionActive },
      });
    });

    return this.getBalance(userId);
  }

  /**
   * Cron 00:00 Asia/Almaty (Б-03…Б-05): списание price с активных подписок.
   * Пропуск при действующем subscriptionFreeUntil (ADR-002). balance < price → деактивация + push.
   * Публичный/тестируемый метод; вызывается из BillingCron.
   */
  async chargeSubscriptions(now = new Date()): Promise<{ charged: number; deactivated: number }> {
    const actives = await this.prisma.specialistProfile.findMany({ where: { subscriptionActive: true } });
    let charged = 0;
    let deactivated = 0;

    for (const p of actives) {
      if (p.subscriptionFreeUntil && p.subscriptionFreeUntil > now) continue; // ADR-002

      if (p.balance < this.price()) {
        await this.prisma.specialistProfile.update({
          where: { id: p.id },
          data: { subscriptionActive: false },
        });
        await this.push.send(p.userId, {
          type: 'low_balance',
          title: 'Низкий баланс',
          body: 'Подписка приостановлена. Пополните баланс, чтобы продолжить получать заказы.',
          payload: { route: '/sp/topup' },
        });
        deactivated++;
      } else {
        const balance = p.balance - this.price();
        await this.prisma.$transaction([
          this.prisma.specialistProfile.update({ where: { id: p.id }, data: { balance } }),
          this.prisma.transaction.create({
            data: { userId: p.userId, type: 'subscription', amount: -this.price(), balanceAfter: balance, meta: { cron: true } },
          }),
        ]);
        charged++;
      }
    }
    this.logger.log(`subscriptions: charged=${charged}, deactivated=${deactivated}`);
    return { charged, deactivated };
  }
}
