import { BidsService } from './bids.service';

// In-memory фейк Prisma для проверки каскада принятия отклика.
function makeFake() {
  const orders: any[] = [{ id: 'o1', clientId: 'client1', status: 'active', title: 'Заказ', acceptedBidId: null }];
  const profiles: any[] = [
    { id: 'sp_a', userId: 'ua', balance: 1000, streakDays: 0, streakLastDate: null },
    { id: 'sp_b', userId: 'ub', balance: 500, streakDays: 0, streakLastDate: null },
    { id: 'sp_c', userId: 'uc', balance: 300, streakDays: 0, streakLastDate: null },
  ];
  const bids: any[] = [
    { id: 'bA', orderId: 'o1', specialistId: 'sp_a', price: 5000, commission: 250, status: 'pending' },
    { id: 'bB', orderId: 'o1', specialistId: 'sp_b', price: 4800, commission: 240, status: 'pending' },
    { id: 'bC', orderId: 'o1', specialistId: 'sp_c', price: 5200, commission: 260, status: 'pending' },
  ];
  const chats: any[] = [];
  const transactions: any[] = [];
  const withRel = (b: any) => ({
    ...b,
    order: orders.find((o) => o.id === b.orderId),
    specialist: profiles.find((p) => p.id === b.specialistId),
  });

  return {
    _bids: bids,
    _orders: orders,
    _chats: chats,
    _transactions: transactions,
    _profiles: profiles,
    bid: {
      findUnique: async ({ where, include }: any) => {
        const b = bids.find((x) => x.id === where.id);
        return b && include ? withRel(b) : b ?? null;
      },
      findMany: async ({ where, include }: any) => {
        let rows = bids.filter((b) => b.orderId === where.orderId);
        if (where.status) rows = rows.filter((b) => (where.status.in ? where.status.in.includes(b.status) : b.status === where.status));
        if (where.id?.not) rows = rows.filter((b) => b.id !== where.id.not);
        return include ? rows.map(withRel) : rows;
      },
      update: async ({ where, data }: any) => {
        const b = bids.find((x) => x.id === where.id);
        Object.assign(b, data);
        return b;
      },
      updateMany: async ({ where, data }: any) => {
        let rows = bids;
        if (where.orderId) rows = rows.filter((b) => b.orderId === where.orderId);
        if (typeof where.id === 'string') rows = rows.filter((b) => b.id === where.id);
        if (where.status) rows = rows.filter((b) => (where.status.in ? where.status.in.includes(b.status) : b.status === where.status));
        if (where.id?.not) rows = rows.filter((b) => b.id !== where.id.not);
        rows.forEach((b) => Object.assign(b, data));
        return { count: rows.length };
      },
    },
    order: {
      update: async ({ where, data }: any) => {
        const o = orders.find((x) => x.id === where.id);
        Object.assign(o, data);
        return o;
      },
    },
    chat: { create: async ({ data }: any) => { chats.push({ id: 'c1', ...data }); return chats[0]; } },
    specialistProfile: {
      findUnique: async ({ where }: any) => profiles.find((p) => p.id === where.id) ?? null,
      update: async ({ where, data }: any) => {
        const p = profiles.find((x) => x.id === where.id);
        Object.assign(p, data);
        return p;
      },
    },
    transaction: { create: async ({ data }: any) => { transactions.push(data); return data; } },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };
}

const config = { get: (k: string) => (k === 'ORDER_COMMISSION_PCT' ? '5' : undefined) } as any;
const push = { send: jest.fn(async () => undefined) } as any;

describe('BidsService.accept — каскад (§6.3, ADR-001)', () => {
  it('принятие → bid accepted, прочие not_selected, заказ in_progress, чат создан, комиссия списана', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    push.send.mockClear();

    const res = await svc.accept('client1', 'bA');

    expect(res).toEqual({ ok: true, cascaded: 2 });
    expect(fake._bids.find((b) => b.id === 'bA').status).toBe('accepted');
    expect(fake._bids.find((b) => b.id === 'bB').status).toBe('not_selected');
    expect(fake._bids.find((b) => b.id === 'bC').status).toBe('not_selected');

    const order = fake._orders[0];
    expect(order.status).toBe('in_progress');
    expect(order.acceptedBidId).toBe('bA');
    expect(fake._chats.length).toBe(1);

    // Комиссия ADR-001: списана с баланса принятого специалиста
    expect(fake._profiles.find((p) => p.id === 'sp_a').balance).toBe(750); // 1000 - 250
    expect(fake._transactions).toHaveLength(1);
    expect(fake._transactions[0]).toMatchObject({ type: 'commission', amount: -250 });

    // Push: принятому + двум «не выбранным»
    expect(push.send).toHaveBeenCalledTimes(3);
  });

  it('чужой заказ → 403 (только заказчик принимает)', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    await expect(svc.accept('someone_else', 'bA')).rejects.toThrow();
  });
});

describe('BidsService counter / acceptCounter (G6 — контрофер round-trip)', () => {
  it('заказчик шлёт встречную → bid countered + counterPrice, push специалисту', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    push.send.mockClear();

    const res = await svc.counter('client1', 'bA', 4000);

    expect(fake._bids.find((b) => b.id === 'bA').status).toBe('countered');
    expect(fake._bids.find((b) => b.id === 'bA').counterPrice).toBe(4000);
    expect(res).toMatchObject({ status: 'countered', counter_price: 4000 });
    expect(push.send).toHaveBeenCalledTimes(1);
  });

  it('специалист принимает встречную → сделка по counterPrice, комиссия от неё, каскад', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    await svc.counter('client1', 'bA', 4000);
    push.send.mockClear();

    const res = await svc.acceptCounter('ua', 'bA'); // ua = userId профиля sp_a

    const bA = fake._bids.find((b) => b.id === 'bA');
    expect(bA.status).toBe('accepted');
    expect(bA.price).toBe(4000); // финальная цена = встречная
    expect(bA.counterPrice).toBeNull();
    expect(bA.commission).toBe(200); // 5% от 4000, а не от исходных 5000
    expect(fake._bids.find((b) => b.id === 'bB').status).toBe('not_selected');
    expect(fake._orders[0].status).toBe('in_progress');
    expect(fake._profiles.find((p) => p.id === 'sp_a').balance).toBe(800); // 1000 - 200
    expect(res).toEqual({ ok: true, cascaded: 2 });
  });

  it('accept на countered-отклике → 400 (по исходной цене принимают только pending)', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    await svc.counter('client1', 'bA', 4000);
    await expect(svc.accept('client1', 'bA')).rejects.toThrow();
  });

  it('чужой специалист не может принять встречную → 403', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    await svc.counter('client1', 'bA', 4000);
    await expect(svc.acceptCounter('ub', 'bA')).rejects.toThrow(); // ub ≠ владелец bA
  });

  it('гонка: counter уже принятого отклика не перезаписывает сделку', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    await svc.accept('client1', 'bA'); // bA → accepted, заказ → in_progress
    await expect(svc.counter('client1', 'bA', 4000)).rejects.toThrow();
    expect(fake._bids.find((b) => b.id === 'bA').status).toBe('accepted'); // не перезаписан
  });

  it('decline уже принятого отклика → 400 (сделку не портим)', async () => {
    const fake = makeFake();
    const svc = new BidsService(fake as any, config, push);
    await svc.accept('client1', 'bA');
    await expect(svc.decline('client1', 'bA')).rejects.toThrow();
    expect(fake._bids.find((b) => b.id === 'bA').status).toBe('accepted');
  });
});
