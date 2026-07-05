import { BillingService } from './billing.service';

function makeFake() {
  const profiles: any[] = [];
  const transactions: any[] = [];
  const api = {
    _profiles: profiles,
    _transactions: transactions,
    specialistProfile: {
      findUnique: async ({ where }: any) => profiles.find((p) => p.id === where.id || p.userId === where.userId) ?? null,
      findMany: async ({ where }: any) =>
        profiles.filter((p) => (where?.subscriptionActive == null ? true : p.subscriptionActive === where.subscriptionActive)),
      update: async ({ where, data }: any) => {
        const p = profiles.find((x) => x.id === where.id);
        Object.assign(p, data);
        return p;
      },
    },
    transaction: { create: async ({ data }: any) => { transactions.push(data); return data; } },
    $transaction: async (arg: any) => (typeof arg === 'function' ? arg(api) : Promise.all(arg)),
  };
  return api;
}

const config = { get: (k: string) => (k === 'SUBSCRIPTION_PRICE' ? '100' : undefined) } as any;
const payment = { topup: jest.fn(async () => ({ ok: true })) } as any;
const push = { send: jest.fn(async () => undefined) } as any;

describe('BillingService.canBid (Б-01, БП-02)', () => {
  it('активная подписка → можно; неактивная без бонуса → нельзя', () => {
    expect(BillingService.canBid({ subscriptionActive: true, subscriptionFreeUntil: null })).toBe(true);
    expect(BillingService.canBid({ subscriptionActive: false, subscriptionFreeUntil: null })).toBe(false);
  });
  it('бонус-период (freeUntil в будущем) → можно даже без активной подписки (ADR-002)', () => {
    const future = new Date(Date.now() + 86400000);
    expect(BillingService.canBid({ subscriptionActive: false, subscriptionFreeUntil: future })).toBe(true);
  });
});

describe('BillingService.topup (БП-07)', () => {
  it('неактивная подписка + пополнение ≥ 100 → немедленное списание 100 + активация', async () => {
    const fake = makeFake();
    fake._profiles.push({ id: 'p1', userId: 'u1', balance: 0, subscriptionActive: false, subscriptionFreeUntil: null });
    const svc = new BillingService(fake as any, config, payment, push);

    await svc.topup('u1', 2000, 'kaspi');

    const p = fake._profiles[0];
    expect(p.subscriptionActive).toBe(true);
    expect(p.balance).toBe(1900); // 0 +2000 −100
    // две транзакции: topup +2000, subscription −100
    expect(fake._transactions.map((t: any) => t.type)).toEqual(['topup', 'subscription']);
  });

  it('пополнение < 100 при неактивной → баланс растёт, подписка НЕ активируется', async () => {
    const fake = makeFake();
    fake._profiles.push({ id: 'p1', userId: 'u1', balance: 20, subscriptionActive: false, subscriptionFreeUntil: null });
    const svc = new BillingService(fake as any, config, payment, push);
    await svc.topup('u1', 50, 'card');
    expect(fake._profiles[0].subscriptionActive).toBe(false);
    expect(fake._profiles[0].balance).toBe(70);
  });
});

describe('BillingService.chargeSubscriptions (cron Б-03…Б-05)', () => {
  it('списывает 100 с активных; balance < 100 → деактивация + push', async () => {
    const fake = makeFake();
    fake._profiles.push(
      { id: 'a', userId: 'ua', balance: 300, subscriptionActive: true, subscriptionFreeUntil: null },
      { id: 'b', userId: 'ub', balance: 50, subscriptionActive: true, subscriptionFreeUntil: null },
    );
    const svc = new BillingService(fake as any, config, payment, push);
    push.send.mockClear();

    const res = await svc.chargeSubscriptions();

    expect(res).toEqual({ charged: 1, deactivated: 1 });
    expect(fake._profiles.find((p: any) => p.id === 'a').balance).toBe(200); // списано 100
    expect(fake._profiles.find((p: any) => p.id === 'b').subscriptionActive).toBe(false); // деактивирован
    expect(push.send).toHaveBeenCalledTimes(1); // push «Низкий баланс»
  });

  it('пропускает специалистов в бонус-периоде subscriptionFreeUntil (ADR-002)', async () => {
    const fake = makeFake();
    const future = new Date(Date.now() + 3 * 86400000);
    fake._profiles.push({ id: 'a', userId: 'ua', balance: 300, subscriptionActive: true, subscriptionFreeUntil: future });
    const svc = new BillingService(fake as any, config, payment, push);
    const res = await svc.chargeSubscriptions();
    expect(res).toEqual({ charged: 0, deactivated: 0 });
    expect(fake._profiles[0].balance).toBe(300); // не списано
  });
});
