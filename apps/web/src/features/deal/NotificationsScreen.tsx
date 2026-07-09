import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, EmptyState, Icon, SkeletonList } from '../../components/ui';
import { fetchNotifications, markNotificationsRead, type Notif } from './api';
import styles from './Notifications.module.scss';

const ICON: Record<string, 'bids' | 'check' | 'wallet' | 'shield' | 'star' | 'bell'> = {
  new_bid: 'bids',
  bid_accepted: 'check',
  bid_not_selected: 'bids',
  low_balance: 'wallet',
  verification_approved: 'shield',
  diploma_approved: 'shield',
  new_review: 'star',
  order_completed: 'check',
  order_awaiting_confirmation: 'check',
};

/** S-32 Уведомления: лента, тап → диплинк, отметка прочитанными. */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: notifs = [], isLoading, refetch } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });

  useEffect(() => {
    void markNotificationsRead().then(() => qc.invalidateQueries({ queryKey: ['notifications'] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen onRefresh={() => refetch()}>
      <AppBar showBack largeTitle={t('notifications.title')} />
      {isLoading ? (
        <SkeletonList count={5} />
      ) : notifs.length === 0 ? (
        <EmptyState icon="bell" title={t('common.emptyDefault')} />
      ) : (
        <div className={styles.list}>
          {notifs.map((n: Notif) => {
            const to = n.payload?.route;
            const cls = [styles.item, n.read ? '' : styles.unread].join(' ');
            const inner = (
              <>
                <div className={styles.icon}>
                  <Icon name={ICON[n.type] ?? 'bell'} size={20} color="var(--c-primary)" />
                </div>
                <div className={styles.body}>
                  <div className={styles.title}>{n.title}</div>
                  <div className={styles.text}>{n.body}</div>
                </div>
                <div className={styles.date}>{new Date(n.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
              </>
            );
            // Диплинк есть → кликабельная кнопка; информационное уведомление → статичный div (не «мёртвая» кнопка).
            return to ? (
              <button key={n.id} className={cls} onClick={() => navigate(to)}>{inner}</button>
            ) : (
              <div key={n.id} className={[cls, styles.static].join(' ')}>{inner}</div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
