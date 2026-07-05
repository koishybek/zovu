import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  MODERATOR_PROVIDER,
  PAYMENT_PROVIDER,
  PUSH_PROVIDER,
  SMS_PROVIDER,
  STORAGE_PROVIDER,
} from './tokens';
import { DevSmsProvider } from './dev/dev-sms.provider';
import { DevModerator } from './dev/dev-moderator.provider';
import { LocalStorageProvider } from './dev/local-storage.provider';
import { DevPushProvider } from './dev/dev-push.provider';
import { DevPaymentProvider } from './dev/dev-payment.provider';

/**
 * Провайдеры интеграций за интерфейсами (docs/08-integrations.md).
 * Выбор реализации — через env (*_PROVIDER). Прод-адаптеры — заглушки (TODO).
 * В M2 все реализации — dev-моки; ни один прод-ключ не нужен.
 */
@Global()
@Module({
  providers: [
    {
      provide: SMS_PROVIDER,
      useFactory: (cfg: ConfigService) => {
        // 'dev' | 'mobizon'(TODO)
        void cfg.get('SMS_PROVIDER');
        return new DevSmsProvider();
      },
      inject: [ConfigService],
    },
    {
      provide: MODERATOR_PROVIDER,
      useClass: DevModerator,
    },
    {
      provide: STORAGE_PROVIDER,
      useFactory: (cfg: ConfigService) => new LocalStorageProvider(cfg),
      inject: [ConfigService],
    },
    {
      provide: PUSH_PROVIDER,
      useFactory: (prisma: PrismaService) => new DevPushProvider(prisma),
      inject: [PrismaService],
    },
    {
      provide: PAYMENT_PROVIDER,
      useClass: DevPaymentProvider,
    },
  ],
  exports: [SMS_PROVIDER, MODERATOR_PROVIDER, STORAGE_PROVIDER, PUSH_PROVIDER, PAYMENT_PROVIDER],
})
export class IntegrationsModule {}
