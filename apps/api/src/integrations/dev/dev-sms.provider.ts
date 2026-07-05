import { Injectable, Logger } from '@nestjs/common';
import type { SmsProvider } from '../tokens';

/** Dev-мок SMS: печатает код в лог (код всегда DEV_OTP_CODE=1111, НФ-05). */
@Injectable()
export class DevSmsProvider implements SmsProvider {
  private readonly logger = new Logger('SMS');

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`OTP → ${phone}: ${code}`);
  }
}
