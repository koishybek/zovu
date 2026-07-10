import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Rating, TextArea, Chip, Celebration } from '../../components/ui';
import { createReview } from './api';
import { createTicket } from '../support/api';
import { apiError } from '../../api/client';
import { routes } from '../../router/routes';
import styles from './Review.module.scss';

const STAR_LABEL = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'];
const GOOD_TAGS = ['onTime', 'quality', 'polite', 'tidy', 'recommend'] as const;
const BAD_TAGS = ['late', 'badQuality', 'priceUp', 'communication', 'notFinished'] as const;

/**
 * S-27 Оценка: двухшаговый условный отзыв (Uber/Thumbtack-стиль).
 * Звезда → 4–5★: хвалебные теги + публичный комментарий; 1–3★: приватная форма проблемы.
 */
export function ReviewScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const positive = stars >= 4;
  const tagKeys = positive ? GOOD_TAGS : BAD_TAGS;

  function toggle(key: string) {
    setTags((v) => (v.includes(key) ? v.filter((x) => x !== key) : [...v, key]));
  }
  function pickStars(n: number) {
    setStars(n);
    setTags([]); // теги зависят от знака оценки — сбрасываем при смене
  }

  async function submit() {
    if (loading || stars === 0) return;
    setLoading(true);
    setError('');
    try {
      const tagText = tags.map((k) => t(`reviewTags.${k}` as never)).join(', ');
      const full = [tagText, text.trim()].filter(Boolean).join(' — ');
      if (positive) {
        // 4–5★: теги и комментарий — публичный отзыв.
        await createReview(id, stars, full || undefined);
      } else {
        // 1–3★: публична только звезда; детали проблемы — приватно в поддержку
        // (честно к копирайту «это увидит только поддержка»).
        await createReview(id, stars);
        if (full) {
          try {
            await createTicket({ category: 'Жалоба', text: full, orderId: id });
          } catch {
            /* тикет — вторичное действие, не блокируем подтверждение отзыва */
          }
        }
      }
      setDone(true);
    } catch (e) {
      const code = apiError(e);
      setError(code.startsWith('moderation_failed') ? 'Текст не прошёл модерацию — переформулируйте' : code === 'already_reviewed' ? 'Вы уже оставили отзыв' : 'Не удалось отправить отзыв');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen footer={<Button onClick={() => navigate(routes.clientOrders, { replace: true })}>{t('common.done')}</Button>}>
        <div className={styles.doneWrap}>
          <Celebration />
          <div className={styles.doneTitle}>{t('notifications.thanksForReview')}</div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button onClick={submit} loading={loading} disabled={stars === 0}>{t('client.leaveReview')}</Button>}>
      <AppBar showBack largeTitle={t('client.howWasWork')} />
      <p className={styles.hint}>{t('client.reviewHelps')}</p>
      <div className={styles.stars}>
        <Rating value={stars} onChange={pickStars} size={44} color="var(--c-primary)" />
        {stars > 0 && <div className={styles.starLabel}>{STAR_LABEL[stars]}</div>}
      </div>

      {stars > 0 && (
        <>
          <div className={styles.tagTitle}>{t(positive ? 'reviewTags.goodTitle' : 'reviewTags.badTitle')}</div>
          {!positive && <div className={styles.badHint}>{t('reviewTags.badHint')}</div>}
          <div className={styles.tags}>
            {tagKeys.map((k) => (
              <Chip key={k} selected={tags.includes(k)} onClick={() => toggle(k)}>{t(`reviewTags.${k}` as never)}</Chip>
            ))}
          </div>
          <TextArea label={t('client.comment')} maxLength={300} value={text} placeholder="Поделитесь впечатлением…" onChange={(e) => setText(e.target.value)} />
          {!positive && (
            <button className={styles.supportLink} onClick={() => navigate(routes.support)}>{t('reviewTags.contactSupport')}</button>
          )}
        </>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </Screen>
  );
}
