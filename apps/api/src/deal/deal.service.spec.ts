import { DealService } from './deal.service';

const DAY = 24 * 60 * 60 * 1000;

function makeFake(orders: any[]) {
  const profiles: any[] = [{ id: 'sp1', completedOrdersCount: 0 }];
  return {
    _orders: orders,
    _profiles: profiles,
    order: {
      findMany: async ({ where }: any) => {
        const now = Date.now();
        return orders.filter((o) => {
          if (where.status && o.status !== where.status) return false;
          if (where.completeRequestedAt?.lt && !(o.completeRequestedAt && o.completeRequestedAt < where.completeRequestedAt.lt)) return false;
          if (where.specialistDoneAt?.lt && !(o.specialistDoneAt && o.specialistDoneAt < where.specialistDoneAt.lt)) return false;
          return true;
        }).map((o) => ({ ...o, bids: [{ status: 'accepted', specialistId: 'sp1', specialist: { userId: 'ua' } }] }));
        void now;
      },
      update: async ({ where, data }: any) => {
        const o = orders.find((x) => x.id === where.id);
        Object.assign(o, data);
        return o;
      },
    },
    specialistProfile: {
      update: async ({ where, data }: any) => {
        const p = profiles.find((x) => x.id === where.id);
        if (data.completedOrdersCount?.increment) p.completedOrdersCount += data.completedOrdersCount.increment;
        return p;
      },
    },
    chat: { updateMany: async () => ({ count: 1 }) },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };
}

const push = { send: jest.fn(async () => undefined) } as any;

describe('DealService.autoClose (ЗВ-03, ЗВ-04)', () => {
  it('ЗВ-03: awaiting_confirmation + 24 ч без подтверждения → completed_auto', async () => {
    const orders = [
      { id: 'o1', status: 'awaiting_confirmation', completeRequestedAt: new Date(Date.now() - DAY - 1000) },
      { id: 'o2', status: 'awaiting_confirmation', completeRequestedAt: new Date(Date.now() - 1000) }, // свежий — не трогать
    ];
    const fake = makeFake(orders);
    const svc = new DealService(fake as any, push);
    const res = await svc.autoClose();
    expect(res.closed).toBe(1);
    expect(orders.find((o) => o.id === 'o1')!.status).toBe('completed_auto');
    expect(orders.find((o) => o.id === 'o2')!.status).toBe('awaiting_confirmation');
    expect(fake._profiles[0].completedOrdersCount).toBe(1);
  });

  it('ЗВ-04: specialistDoneAt + 24 ч бездействия заказчика → completed_auto', async () => {
    const orders = [{ id: 'o3', status: 'in_progress', specialistDoneAt: new Date(Date.now() - DAY - 1000) }];
    const fake = makeFake(orders);
    const svc = new DealService(fake as any, push);
    const res = await svc.autoClose();
    expect(res.closed).toBe(1);
    expect(orders[0].status).toBe('completed_auto');
  });
});
