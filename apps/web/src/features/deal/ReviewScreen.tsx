import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Rating, TextArea, Celebration } from '../../components/ui';
import { createReview } from './api';
import { apiError } from '../../api/client';
import { routes } from '../../router/routes';
import styles from './Review.module.scss';

const STAR_LABEL = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'];

/** S-27 Оценка и отзыв: 5★ + комментарий ≤300 (стоп-словарь на сервере). */
export function ReviewScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await createReview(id, stars, text.trim() || undefined);
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
    <Screen footer={<Button onClick={submit} loading={loading}>{t('client.leaveReview')}</Button>}>
      <AppBar showBack largeTitle={t('client.howWasWork')} />
      <p className={styles.hint}>{t('client.reviewHelps')}</p>
      <div className={styles.stars}>
        <Rating value={stars} onChange={setStars} size={44} />
        <div className={styles.starLabel}>{STAR_LABEL[stars]}</div>
      </div>
      <TextArea label={t('client.comment')} maxLength={300} value={text} placeholder="Поделитесь впечатлением…" onChange={(e) => setText(e.target.value)} />
      {error && <div className={styles.error}>{error}</div>}
    </Screen>
  );
}
