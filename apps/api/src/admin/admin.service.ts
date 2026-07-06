import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PUSH_PROVIDER, type PushProvider } from '../integrations/tokens';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUSH_PROVIDER) private readonly push: PushProvider,
  ) {}

  private audit(action: string, target: string, meta: object = {}) {
    return this.prisma.adminAudit.create({ data: { action, target, meta } });
  }

  // ---- Очереди ----
  verificationQueue() {
    return this.prisma.verificationRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: { specialist: { include: { user: { select: { name: true, phone: true } } } } },
    });
  }
  diplomaQueue() {
    return this.prisma.specialistProfile.findMany({
      where: { diplomaStatus: 'pending' },
      include: { user: { select: { name: true, phone: true } } },
    });
  }
  categoryQueue() {
    return this.prisma.category.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' } });
  }
  complaintQueue() {
    return this.prisma.reviewComplaint.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'asc' },
      include: { review: true },
    });
  }
  ticketQueue() {
    return this.prisma.supportTicket.findMany({
      where: { status: { in: ['new', 'in_progress'] } },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true, phone: true } }, messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
  auditLog() {
    return this.prisma.adminAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }

  // ---- Верификация (В-*) ----
  async approveVerification(id: string) {
    const r = await this.prisma.verificationRequest.findUnique({ where: { id }, include: { specialist: true } });
    if (!r) throw new NotFoundException('request_not_found');
    await this.prisma.$transaction([
      this.prisma.verificationRequest.update({ where: { id }, data: { status: 'approved', reviewedAt: new Date() } }),
      this.prisma.specialistProfile.update({ where: { id: r.specialistId }, data: { verificationStatus: 'approved' } }),
    ]);
    await this.audit('verification.approve', id);
    await this.push.send(r.specialist.userId, { type: 'verification_approved', title: 'Верификация пройдена', body: 'Ваш профиль подтверждён.' });
    return { ok: true };
  }
  async rejectVerification(id: string, reason: string) {
    const r = await this.prisma.verificationRequest.findUnique({ where: { id }, include: { specialist: true } });
    if (!r) throw new NotFoundException('request_not_found');
    await this.prisma.$transaction([
      this.prisma.verificationRequest.update({ where: { id }, data: { status: 'rejected', reason, reviewedAt: new Date() } }),
      this.prisma.specialistProfile.update({ where: { id: r.specialistId }, data: { verificationStatus: 'rejected' } }),
    ]);
    await this.audit('verification.reject', id, { reason });
    await this.push.send(r.specialist.userId, { type: 'verification_rejected', title: 'Верификация отклонена', body: reason });
    return { ok: true };
  }

  // ---- Дипломы (ДС-*) ----
  async diplomaAction(profileId: string, action: 'approve' | 'reject' | 'revoke', reason?: string) {
    const p = await this.prisma.specialistProfile.findUnique({ where: { id: profileId } });
    if (!p) throw new NotFoundException('profile_not_found');
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'none';
    await this.prisma.specialistProfile.update({ where: { id: profileId }, data: { diplomaStatus: status } });
    await this.audit(`diploma.${action}`, profileId, reason ? { reason } : {});
    await this.push.send(p.userId, {
      type: `diploma_${action}`,
      title: action === 'approve' ? 'Диплом подтверждён' : action === 'reject' ? 'Диплом отклонён' : 'Статус диплома отозван',
      body: reason ?? '',
    });
    return { ok: true };
  }

  // ---- Категории (К-*, ADR-002 бонус) ----
  async approveCategory(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('category_not_found');
    await this.prisma.category.update({ where: { id }, data: { status: 'approved' } });

    // ADR-002: автору — 3 дня подписки бесплатно
    if (cat.createdById) {
      const profile = await this.prisma.specialistProfile.findUnique({ where: { userId: cat.createdById } });
      if (profile) {
        const base = profile.subscriptionFreeUntil && profile.subscriptionFreeUntil > new Date() ? profile.subscriptionFreeUntil : new Date();
        await this.prisma.specialistProfile.update({
          where: { id: profile.id },
          data: { subscriptionFreeUntil: new Date(base.getTime() + 3 * DAY_MS) },
        });
      }
      await this.push.send(cat.createdById, { type: 'category_approved', title: 'Категория одобрена', body: `«${cat.name}» + 3 дня подписки бесплатно` });
    }
    await this.audit('category.approve', id);
    return { ok: true };
  }
  async rejectCategory(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('category_not_found');
    await this.prisma.category.update({ where: { id }, data: { status: 'rejected' } });
    if (cat.createdById) await this.push.send(cat.createdById, { type: 'category_rejected', title: 'Категория отклонена', body: cat.name });
    await this.audit('category.reject', id);
    return { ok: true };
  }

  // ---- Жалобы на отзывы (ОМ-*) ----
  async hideReview(reviewId: string) {
    const r = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!r) throw new NotFoundException('review_not_found');
    await this.prisma.review.update({ where: { id: reviewId }, data: { status: 'hidden' } });
    await this.prisma.reviewComplaint.updateMany({ where: { reviewId, status: 'open' }, data: { status: 'resolved', resolution: 'hidden' } });
    await this.recomputeRating(r.toUserId);
    await this.audit('review.hide', reviewId);
    await this.push.send(r.fromUserId, { type: 'review_hidden', title: 'Ваш отзыв скрыт', body: 'Модерация скрыла отзыв.' });
    return { ok: true };
  }
  async restoreReview(reviewId: string) {
    const r = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!r) throw new NotFoundException('review_not_found');
    await this.prisma.review.update({ where: { id: reviewId }, data: { status: 'published' } });
    await this.recomputeRating(r.toUserId);
    await this.audit('review.restore', reviewId);
    return { ok: true };
  }
  async resolveComplaint(complaintId: string) {
    await this.prisma.reviewComplaint.update({ where: { id: complaintId }, data: { status: 'resolved', resolution: 'kept' } });
    await this.audit('complaint.resolve', complaintId);
    return { ok: true };
  }

  // ---- Тикеты (СП-*) ----
  async ticketTake(id: string) {
    await this.prisma.supportTicket.update({ where: { id }, data: { status: 'in_progress' } });
    await this.audit('ticket.take', id);
    return { ok: true };
  }
  async ticketReply(id: string, text: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('ticket_not_found');
    await this.prisma.supportMessage.create({ data: { ticketId: id, senderType: 'agent', text } });
    await this.push.send(ticket.userId, { type: 'support_reply', title: 'Ответ поддержки', body: text.slice(0, 80), payload: { route: `/support/${id}` } });
    await this.audit('ticket.reply', id);
    return { ok: true };
  }
  async ticketResolve(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('ticket_not_found');
    await this.prisma.supportTicket.update({ where: { id }, data: { status: 'resolved' } });
    // спор: если тикет привязан к заказу, снять флаг disputed
    if (ticket.orderId) {
      await this.prisma.order.updateMany({ where: { id: ticket.orderId, status: 'disputed' }, data: { status: 'in_progress' } });
    }
    await this.push.send(ticket.userId, { type: 'support_resolved', title: 'Обращение решено', body: '', payload: { route: `/support/${id}` } });
    await this.audit('ticket.resolve', id);
    return { ok: true };
  }

  // ---- Пользователи (СП-09 / ADR-007) ----
  async userAction(userId: string, action: 'warn' | 'block' | 'unblock', reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user_not_found');
    if (action === 'block') {
      await this.prisma.user.update({ where: { id: userId }, data: { blockedAt: new Date(), blockedReason: reason ?? 'Нарушение правил' } });
    } else if (action === 'unblock') {
      await this.prisma.user.update({ where: { id: userId }, data: { blockedAt: null, blockedReason: null } });
    }
    await this.audit(`user.${action}`, userId, reason ? { reason } : {});
    await this.push.send(userId, {
      type: `user_${action}`,
      title: action === 'block' ? 'Аккаунт заблокирован' : action === 'warn' ? 'Предупреждение' : 'Блокировка снята',
      body: reason ?? '',
    });
    return { ok: true };
  }

  private async recomputeRating(toUserId: string) {
    const agg = await this.prisma.review.aggregate({ where: { toUserId, status: 'published' }, _avg: { stars: true } });
    const profile = await this.prisma.specialistProfile.findUnique({ where: { userId: toUserId } });
    if (profile) await this.prisma.specialistProfile.update({ where: { id: profile.id }, data: { rating: agg._avg.stars ?? 0 } });
  }
}
