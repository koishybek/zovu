import { Injectable } from '@nestjs/common';
import type { ModerationResult, Moderator } from '../tokens';

/**
 * Dev-модератор: стоп-словарь RU/KZ (мат, оскорбления, ссылки/спам) — ОМ-01, ОМ-02.
 * Прод-адаптер AnthropicModerator — TODO.
 */
@Injectable()
export class DevModerator implements Moderator {
  private readonly stopwords = [
    // мат / оскорбления (корни, RU)
    'сука',
    'блят',
    'бляд',
    'хуй',
    'хуе',
    'пизд',
    'ебан',
    'еба',
    'мудак',
    'долбо',
    'гандон',
    'урод',
    'идиот',
    'дебил',
    'придурок',
    // KZ-кальки/оскорбления
    'ақымақ',
    'есек',
    'антұрған',
  ];

  private readonly linkRe = /(https?:\/\/|www\.|t\.me\/|wa\.me\/|\+7\d{9,}|@[\w]{4,})/i;

  async check(text: string): Promise<ModerationResult> {
    const lower = text.toLowerCase();
    for (const w of this.stopwords) {
      if (lower.includes(w)) {
        return { ok: false, reason: 'profanity' };
      }
    }
    if (this.linkRe.test(text)) {
      return { ok: false, reason: 'link_or_spam' };
    }
    return { ok: true };
  }
}
