import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Avatar, Rating, EmptyState, Icon, SkeletonList } from '../../components/ui';
import { fetchUserReviews, type UserReview } from './api';
import { ReportFlow } from '../support/ReportFlow';
import styles from './ReviewsList.module.scss';

/** S-33 Отзывы о пользователе (только published, ОМ-08). Кнопка «Пожаловаться» на каждом (ОМ-03). */
export function ReviewsListScreen() {
  const { t } = useTranslation();
  const { userId = '' } = useParams();
  const { data: reviews = [], isLoading } = useQuery({ queryKey: ['reviews', userId], queryFn: () => fetchUserReviews(userId) });
  const [reportSubject, setReportSubject] = useState<string | null>(null);

  return (
    <Screen>
      <AppBar showBack largeTitle={t('specialist.reviews')} />
      {isLoading ? (
        <SkeletonList count={4} />
      ) : reviews.length === 0 ? (
        <EmptyState icon="star" title={t('common.emptyDefault')} hint={t('specialist.reviewsEmptyHint')} />
      ) : (
        <div className={styles.list}>
          {reviews.map((r: UserReview) => (
            <Card key={r.id}>
              <div className={styles.top}>
                <Avatar name={r.author_name ?? ''} size={40} />
                <div className={styles.who}>
                  <div className={styles.name}>{r.author_name}</div>
                  <div className={styles.date}>{new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                </div>
                <Rating value={r.stars} size={16} readOnly />
              </div>
              {r.text && <div className={styles.text}>{r.text}</div>}
              <button className={styles.report} onClick={() => setReportSubject(r.author_name || t('specialist.reviews'))}>
                <Icon name="flag" size={14} color="var(--c-ink-muted)" /> {t('chat.report')}
              </button>
            </Card>
          ))}
        </div>
      )}
      <ReportFlow open={reportSubject != null} onClose={() => setReportSubject(null)} subject={reportSubject ?? undefined} />
    </Screen>
  );
}
