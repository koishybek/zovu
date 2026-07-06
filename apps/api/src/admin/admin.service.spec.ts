import { AdminService } from './admin.service';

const DAY = 24 * 60 * 60 * 1000;

function makeFake(cat: any, profile: any) {
  const audits: any[] = [];
  return {
    _audits: audits,
    _profile: profile,
    category: {
      findUnique: async () => cat,
      update: async ({ data }: any) => { Object.assign(cat, data); return cat; },
    },
    specialistProfile: {
      findUnique: async () => profile,
      update: async ({ data }: any) => { if (profile) Object.assign(profile, data); return profile; },
    },
    adminAudit: { create: async ({ data }: any) => { audits.push(data); return data; } },
  };
}
const push = { send: jest.fn(async () => undefined) } as any;

describe('AdminService.approveCategory (К-06, ADR-002 бонус)', () => {
  it('одобрение категории → статус approved + 3 дня подписки автору + аудит', async () => {
    const cat = { id: 'c1', name: 'Кровельные работы', status: 'pending', createdById: 'u1' };
    const profile = { id: 'p1', userId: 'u1', subscriptionFreeUntil: null };
    const fake = makeFake(cat, profile);
    const svc = new AdminService(fake as any, push);

    await svc.approveCategory('c1');

    expect(cat.status).toBe('approved');
    // бонус ~3 дня от now
    const delta = profile.subscriptionFreeUntil!.getTime() - Date.now();
    expect(delta).toBeGreaterThan(3 * DAY - 5000);
    expect(delta).toBeLessThan(3 * DAY + 5000);
    expect(fake._audits[0].action).toBe('category.approve');
    expect(push.send).toHaveBeenCalled();
  });

  it('бонус продлевает существующий freeUntil (max(now, freeUntil)+3d)', async () => {
    const future = new Date(Date.now() + 2 * DAY);
    const cat = { id: 'c1', name: 'X', status: 'pending', createdById: 'u1' };
    const profile = { id: 'p1', userId: 'u1', subscriptionFreeUntil: future };
    const svc = new AdminService(makeFake(cat, profile) as any, push);
    await svc.approveCategory('c1');
    const delta = profile.subscriptionFreeUntil!.getTime() - Date.now();
    expect(delta).toBeGreaterThan(5 * DAY - 5000); // 2 + 3 дня
  });
});
