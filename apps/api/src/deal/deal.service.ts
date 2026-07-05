import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PUSH_PROVIDER, type PushProvider } from '../integrations/tokens';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DealService {
  private readonly logger = new Logger('Deal');

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
  ) {}

  private async loadOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { bids: { where: { status: 'accepted' }, include: { specialist: true } } },
    });
    if (!order) throw new NotFoundException('order_not_found');
    return order;
  }

  /** ЗВ-01: только заказчик жмёт «Завершить» → awaiting_confirmation. */
  async complete(userId: string, orderId: string) {
    const order = await this.loadOrder(orderId);
    if (order.clientId !== userId) throw new ForbiddenException('only_client_completes');
    if (order.status !== 'in_progress') throw new BadRequestException('order_not_in_progress');

    await this.prisma.order.update({ where: { id: orderId }, data: { status: 'awaiting_confirmation', completeRequestedAt: new Date() } });
    const spUserId = order.bids[0]?.specialist.userId;
    if (spUserId) {
      await this.push.send(spUserId, {
        type: 'order_awaiting_confirmation',
        title: 'Подтвердите выполнение',
        body: order.title,
        payload: { route: `/chat/${orderId}` },
      });
    }
    return { status: 'awaiting_confirmation' };
  }

  /** ЗВ-02: специалист подтверждает выполнение → completed (+ пересчёт метрик). */
  async confirm(userId: string, orderId: string) {
    const order = await this.loadOrder(orderId);
    const spUserId = order.bids[0]?.specialist.userId;
    if (spUserId !== userId) throw new ForbiddenException('only_specialist_confirms');
    if (order.status !== 'awaiting_confirmation') throw new BadRequestException('not_awaiting_confirmation');

    await this.finalize(orderId, order.bids[0].specialistId, 'completed');
    await this.push.send(order.clientId, { type: 'order_completed', title: 'Заказ выполнен', body: order.title, payload: { route: `/client/orders/${orderId}/review` } });
    return { status: 'completed' };
  }

  /** ЗВ-04: специалист отмечает «работа выполнена с моей стороны». */
  async specialistDone(userId: string, orderId: string) {
    const order = await this.loadOrder(orderId);
    const spUserId = order.bids[0]?.specialist.userId;
    if (spUserId !== userId) throw new ForbiddenException('only_specialist');
    if (order.status !== 'in_progress') throw new BadRequestException('order_not_in_progress');
    await this.prisma.order.update({ where: { id: orderId }, data: { specialistDoneAt: new Date() } });
    await this.push.send(order.clientId, { type: 'specialist_done', title: 'Специалист отметил выполнение', body: order.title, payload: { route: `/client/orders/${orderId}` } });
    return { ok: true };
  }

  /** Общий финализатор: статус + пересчёт completedOrdersCount + окно оценки. */
  private async finalize(orderId: string, specialistId: string, status: 'completed' | 'completed_auto') {
    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status, completedAt: status === 'completed' ? new Date() : undefined, autoClosedAt: status === 'completed_auto' ? new Date() : undefined },
      }),
      this.prisma.specialistProfile.update({ where: { id: specialistId }, data: { completedOrdersCount: { increment: 1 } } }),
      this.prisma.chat.updateMany({ where: { orderId }, data: { closedAt: new Date() } }), // Ч-07 read-only после завершения
    ]);
  }

  /**
   * Cron автозакрытия (каждые 10 мин):
   * ЗВ-03: awaiting_confirmation + 24 ч без подтверждения → completed_auto.
   * ЗВ-04: specialistDoneAt + 24 ч бездействия заказчика (заказ ещё in_progress) → completed_auto.
   */
  async autoClose(now = new Date()): Promise<{ closed: number }> {
    const threshold = new Date(now.getTime() - DAY_MS);

    // ЗВ-03: заказчик нажал «Завершить», специалист не подтвердил за 24 ч.
    const awaiting = await this.prisma.order.findMany({
      where: { status: 'awaiting_confirmation', completeRequestedAt: { lt: threshold } },
      include: { bids: { where: { status: 'accepted' } } },
    });
    // ЗВ-04: специалист отметил выполнение, заказчик бездействует 24 ч.
    const mirror = await this.prisma.order.findMany({
      where: { status: 'in_progress', specialistDoneAt: { lt: threshold } },
      include: { bids: { where: { status: 'accepted' } } },
    });

    let closed = 0;
    for (const o of [...awaiting, ...mirror]) {
      const sp = o.bids[0];
      if (!sp) continue;
      await this.finalize(o.id, sp.specialistId, 'completed_auto');
      closed++;
    }
    if (closed) this.logger.log(`auto-closed ${closed} orders`);
    return { closed };
  }
}
