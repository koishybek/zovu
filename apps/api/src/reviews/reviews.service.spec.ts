import { ReviewsService } from './reviews.service';
import { DevModerator } from '../integrations/dev/dev-moderator.provider';

function makeFake() {
  const reviews: any[] = [];
  const profiles: any[] = [{ id: 'sp1', userId: 'spU', rating: 0 }];
  const orders: any[] = [
    { id: 'o1', status: 'completed', clientId: 'clientU', autoClosedAt: null, bids: [{ status: 'accepted', specialist: { userId: 'spU' } }] },
  ];
  return {
    _reviews: reviews,
    _profiles: profiles,
    order: {
      findUnique: async ({ where }: any) => orders.find((o) => o.id === where.id) ?? null,
    },
    review: {
      findUnique: async ({ where }: any) =>
        reviews.find((r) => r.id === where.id || (where.orderId_fromUserId && r.orderId === where.orderId_fromUserId.orderId && r.fromUserId === where.orderId_fromUserId.fromUserId)) ?? null,
      create: async ({ data }: any) => {
        const r = { id: `r${reviews.length + 1}`, status: 'published', ...data };
        reviews.push(r);
        return r;
      },
      update: async ({ where, data }: any) => {
        const r = reviews.find((x) => x.id === where.id);
        Object.assign(r, data);
        return r;
      },
      aggregate: async ({ where }: any) => {
        const rel = reviews.filter((r) => r.toUserId === where.toUserId && r.status === 'published');
        return { _avg: { stars: rel.length ? rel.reduce((s, r) => s + r.stars, 0) / rel.length : null } };
      },
    },
    specialistProfile: {
      findUnique: async ({ where }: any) => profiles.find((p) => p.userId === where.userId) ?? null,
      update: async ({ where, data }: any) => {
        const p = profiles.find((x) => x.id === where.id);
        Object.assign(p, data);
        return p;
      },
    },
    reviewComplaint: { create: async () => ({}) },
  };
}

const push = { send: jest.fn(async () => undefined) } as any;
const moderator = new DevModerator();

describe('ReviewsService (О-*, ОМ-*)', () => {
  it('О-04: второй отзыв той же стороны на тот же заказ → already_reviewed', async () => {
    const fake = makeFake();
    const svc = new ReviewsService(fake as any, moderator, push);
    await svc.create('clientU', 'o1', 5, 'Отлично');
    await expect(svc.create('clientU', 'o1', 4)).rejects.toThrow('already_reviewed');
  });

  it('ОМ-01/02: мат в тексте → moderation_failed', async () => {
    const fake = makeFake();
    const svc = new ReviewsService(fake as any, moderator, push);
    await expect(svc.create('clientU', 'o1', 1, 'ты идиот')).rejects.toThrow(/moderation_failed/);
  });

  it('ОМ-06: рейтинг специалиста пересчитывается по опубликованным отзывам', async () => {
    const fake = makeFake();
    const svc = new ReviewsService(fake as any, moderator, push);
    await svc.create('clientU', 'o1', 4, 'Хорошо');
    expect(fake._profiles[0].rating).toBe(4);
  });

  it('заказ не завершён → нельзя оставить отзыв', async () => {
    const fake = makeFake();
    (await fake.order.findUnique({ where: { id: 'o1' } })).status = 'in_progress';
    const svc = new ReviewsService(fake as any, moderator, push);
    await expect(svc.create('clientU', 'o1', 5)).rejects.toThrow('order_not_completed');
  });
});
