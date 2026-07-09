import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';

// In-memory фейк Prisma для проверки отмены заказа (ЗВ-07) и каскада откликов.
function makeFake(orderStatus = 'active') {
  const orders: any[] = [{ id: 'o1', clientId: 'client1', status: orderStatus }];
  const bids: any[] = [
    { id: 'bA', orderId: 'o1', status: 'pending' },
    { id: 'bB', orderId: 'o1', status: 'pending' },
    { id: 'bC', orderId: 'o1', status: 'declined' },
  ];
  return {
    _orders: orders,
    _bids: bids,
    order: {
      findUnique: async ({ where }: any) => orders.find((o) => o.id === where.id) ?? null,
      update: async ({ where, data }: any) => {
        const o = orders.find((x) => x.id === where.id);
        Object.assign(o, data);
        return o;
      },
    },
    bid: {
      updateMany: async ({ where, data }: any) => {
        const rows = bids.filter((b) => b.orderId === where.orderId && (!where.status || b.status === where.status));
        rows.forEach((b) => Object.assign(b, data));
        return { count: rows.length };
      },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };
}

describe('OrdersService.cancel (ЗВ-07)', () => {
  it('до принятия: заказ → cancelled, висящие pending-отклики → not_selected (declined не трогаем)', async () => {
    const fake = makeFake('active');
    const svc = new OrdersService(fake as any);

    const res = await svc.cancel('client1', 'o1');

    expect(res).toEqual({ status: 'cancelled' });
    expect(fake._orders[0].status).toBe('cancelled');
    expect(fake._bids.find((b) => b.id === 'bA').status).toBe('not_selected');
    expect(fake._bids.find((b) => b.id === 'bB').status).toBe('not_selected');
    expect(fake._bids.find((b) => b.id === 'bC').status).toBe('declined'); // не pending — без изменений
  });

  it('после принятия (не active): 400 cancel_after_accept_via_support, статус не меняется', async () => {
    const fake = makeFake('in_progress');
    const svc = new OrdersService(fake as any);

    await expect(svc.cancel('client1', 'o1')).rejects.toBeInstanceOf(BadRequestException);
    expect(fake._orders[0].status).toBe('in_progress');
    expect(fake._bids.find((b) => b.id === 'bA').status).toBe('pending');
  });

  it('чужой заказ: 403 not_your_order', async () => {
    const fake = makeFake('active');
    const svc = new OrdersService(fake as any);
    await expect(svc.cancel('someone_else', 'o1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(fake._orders[0].status).toBe('active');
  });
});
