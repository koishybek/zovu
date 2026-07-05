// DI-токены провайдеров интеграций (docs/08-integrations.md). Выбор реализации — через env.

export const SMS_PROVIDER = Symbol('SmsProvider');
export const PAYMENT_PROVIDER = Symbol('PaymentProvider');
export const PUSH_PROVIDER = Symbol('PushProvider');
export const STORAGE_PROVIDER = Symbol('StorageProvider');
export const MODERATOR_PROVIDER = Symbol('ModeratorProvider');

export interface SmsProvider {
  send(phone: string, code: string): Promise<void>;
}

export interface PaymentProvider {
  topup(userId: string, amount: number, method: string): Promise<{ ok: boolean }>;
}

export interface PushNotif {
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
}

export interface PushProvider {
  send(userId: string, notif: PushNotif): Promise<void>;
}

export interface StorageProvider {
  /** Сохраняет файл, возвращает ключ. `privateBucket` — для документов (НФ-09). */
  put(buffer: Buffer, ext: string, privateBucket?: boolean): Promise<string>;
  getPath(key: string): string;
}

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export interface Moderator {
  check(text: string): Promise<ModerationResult>;
}
