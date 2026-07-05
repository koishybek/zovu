import { Injectable } from '@nestjs/common';
import type { PaymentProvider } from '../tokens';

/** Dev-платёж: мгновенный успех (S-16, «Комиссия не взимается»). Прод — KaspiPayProvider (TODO). */
@Injectable()
export class DevPaymentProvider implements PaymentProvider {
  async topup(_userId: string, _amount: number, _method: string): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}
