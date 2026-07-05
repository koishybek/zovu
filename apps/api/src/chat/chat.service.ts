import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** Проверка, что пользователь — участник заказа этого чата. */
  async assertParty(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { order: { include: { bids: { where: { status: 'accepted' }, include: { specialist: true } } } } },
    });
    if (!chat) throw new NotFoundException('chat_not_found');
    const spUserId = chat.order.bids[0]?.specialist.userId;
    if (chat.order.clientId !== userId && spUserId !== userId) throw new ForbiddenException('not_a_party');
    return chat;
  }

  /** Список чатов пользователя (Ч-06: история). */
  async myChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: { order: { OR: [{ clientId: userId }, { bids: { some: { status: 'accepted', specialist: { userId } } } }] } },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, title: true, clientId: true, status: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: { where: { readAt: null } } } },
      },
    });
    return chats.map((c) => ({
      id: c.id,
      order: c.order,
      closed: c.closedAt != null,
      last_message: c.messages[0]?.text ?? null,
      unread: c._count.messages,
    }));
  }

  async messages(userId: string, chatId: string) {
    await this.assertParty(userId, chatId);
    const rows = await this.prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: 'asc' } });
    return rows.map((m) => this.serialize(m));
  }

  /** Ч-07: после завершения и оценки чат read-only. */
  async send(userId: string, chatId: string, text: string) {
    const chat = await this.assertParty(userId, chatId);
    if (chat.closedAt) throw new ForbiddenException('chat_closed');
    const msg = await this.prisma.message.create({ data: { chatId, senderId: userId, text } });
    return this.serialize(msg);
  }

  async markRead(userId: string, chatId: string) {
    await this.assertParty(userId, chatId);
    await this.prisma.message.updateMany({
      where: { chatId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  private serialize(m: { id: string; chatId: string; senderId: string; text: string; readAt: Date | null; createdAt: Date }) {
    return {
      id: m.id,
      chat_id: m.chatId,
      sender_id: m.senderId,
      text: m.text,
      read: m.readAt != null,
      created_at: m.createdAt.toISOString(),
    };
  }
}
