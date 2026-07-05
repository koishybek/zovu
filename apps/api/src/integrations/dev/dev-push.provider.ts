import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PushNotif, PushProvider } from '../tokens';

/**
 * Dev-push: пишет запись в Notification (лента S-32) + (в M6) эмит по WS.
 * Прод-адаптер FcmPushProvider — TODO.
 */
@Injectable()
export class DevPushProvider implements PushProvider {
  constructor(private readonly prisma: PrismaService) {}

  async send(userId: string, notif: PushNotif): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        payload: (notif.payload ?? {}) as object,
      },
    });
    // TODO(M6): эмит события в WS-шлюз уведомлений.
  }
}
