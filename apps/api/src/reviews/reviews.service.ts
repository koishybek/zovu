import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MODERATOR_PROVIDER, type Moderator, PUSH_PROVIDER, type PushProvider } from '../integrations/tokens';

const DAY_MS = 24 * 60 * 60 * 1000;
const RATING_WINDOW_MS = 7 * DAY_MS; // ЗВ-05: 7 дней после автозакрытия

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MODERATOR_PROVIDER) private readonly moderator: Moderator,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
  ) {}

  /** S-27: оценка 1–5★ + комментарий. О-04 один раз на заказ; стоп-словарь ОМ-01/02; окно ЗВ-05. */
  async create(userId: string, orderId: string, stars: number, text?: string) {
    if (stars < 1 || stars > 5) throw new BadRequestException('invalid_stars');
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { bids: { where: { status: 'accepted' }, include: { specialist: true } } },
    });
    if (!order) throw new NotFoundException('order_not_found');
    if (order.status !== 'completed' && order.status !== 'completed_auto') {
      throw new BadRequestException('order_not_completed');
    }

    const specialistUserId = order.bids[0]?.specialist.userId;
    const isClient = order.clientId === userId;
    const isSpecialist = specialistUserId === userId;
    if (!isClient && !isSpecialist) throw new ForbiddenException('not_a_party');
    const toUserId = isClient ? specialistUserId! : order.clientId;

    // ЗВ-05: окно 7 дней после автозакрытия
    if (order.status === 'completed_auto' && order.autoClosedAt && Date.now() - order.autoClosedAt.getTime() > RATING_WINDOW_MS) {
      throw new BadRequestException('review_window_closed');
    }

    // ОМ-01/02: пре-модерация текста
    if (text) {
      const check = await this.moderator.check(text);
      if (!check.ok) throw new BadRequestException(`moderation_failed:${check.reason ?? 'blocked'}`);
    }

    // О-04: один раз на заказ с каждой стороны
    const existing = await this.prisma.review.findUnique({ where: { orderId_fromUserId: { orderId, fromUserId: userId } } });
    if (existing) throw new BadRequestException('already_reviewed');

    const review = await this.prisma.review.create({
      data: { orderId, fromUserId: userId, toUserId, stars, text, editableUntil: new Date(Date.now() + DAY_MS) },
    });

    if (isClient && specialistUserId) await this.recomputeRating(specialistUserId);
    await this.push.send(toUserId, { type: 'new_review', title: 'Новый отзыв', body: `Оценка ${stars}★`, payload: { route: `/reviews/${toUserId}` } });
    return this.serialize(review);
  }

  /** ОМ-07: редактирование 24 ч. */
  async edit(userId: string, reviewId: string, stars: number, text?: string) {
    const r = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!r) throw new NotFoundException('review_not_found');
    if (r.fromUserId !== userId) throw new ForbiddenException('not_author');
    if (r.editableUntil.getTime() < Date.now()) throw new BadRequestException('edit_window_closed');
    if (text) {
      const check = await this.moderator.check(text);
      if (!check.ok) throw new BadRequestException(`moderation_failed:${check.reason ?? 'blocked'}`);
    }
    const updated = await this.prisma.review.update({ where: { id: reviewId }, data: { stars, text } });
    await this.recomputeRatingByUser(r.toUserId);
    return this.serialize(updated);
  }

  /** ОМ-03: жалоба на отзыв → очередь админа; отзыв остаётся видимым. */
  async complaint(userId: string, reviewId: string, reason: string) {
    const r = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!r) throw new NotFoundException('review_not_found');
    await this.prisma.reviewComplaint.create({ data: { reviewId, byUserId: userId, reason } });
    return { ok: true };
  }

  /** S-33: отзывы о пользователе (только published, ОМ-08). */
  async userReviews(userId: string) {
    const rows = await this.prisma.review.findMany({
      where: { toUserId: userId, status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: true },
    });
    return rows.map((r) => ({
      id: r.id,
      stars: r.stars,
      text: r.text,
      author_name: r.fromUser.name,
      created_at: r.createdAt.toISOString(),
    }));
  }

  /** ОМ-06: пересчёт кэша рейтинга (скрытые исключены). */
  private async recomputeRating(specialistUserId: string) {
    await this.recomputeRatingByUser(specialistUserId);
  }

  private async recomputeRatingByUser(toUserId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { toUserId, status: 'published' },
      _avg: { stars: true },
    });
    const profile = await this.prisma.specialistProfile.findUnique({ where: { userId: toUserId } });
    if (profile) {
      await this.prisma.specialistProfile.update({
        where: { id: profile.id },
        data: { rating: agg._avg.stars ?? 0 },
      });
    }
  }

  private serialize(r: { id: string; stars: number; text: string | null; status: string; editableUntil: Date }) {
    return { id: r.id, stars: r.stars, text: r.text, status: r.status, editable_until: r.editableUntil.toISOString() };
  }
}
