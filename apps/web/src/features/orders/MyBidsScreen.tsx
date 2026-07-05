import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Price, BidStatusPill, EmptyState } from '../../components/ui';
import type { BidStatus } from '../../components/ui';
import { fetchMyBids } from './api';
import { routes } from '../../router/routes';
import styles from './FeedScreen.module.scss';

const BID_LABEL: Record<string, string> = {
  pending: 'status.waiting',
  accepted: 'status.accepted',
  not_selected: 'status.notSelected',
  declined: 'status.notSelected',
};

/** S-14 Отклики специалиста. */
export function MyBidsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: bids = [], isLoading } = useQuery({ queryKey: ['my-bids'], queryFn: fetchMyBids, refetchInterval: 8000 });

  return (
    <Screen>
      <AppBar largeTitle={t('tabbar.bids')} />
      {isLoading ? (
        <div className={styles.center}>{t('common.loading')}</div>
      ) : bids.length === 0 ? (
        <EmptyState icon="bids" title="Откликов пока нет" hint="Свайпните заказ вправо в колоде, чтобы откликнуться" />
      ) : (
        <div className={styles.list}>
          {bids.map((b) => (
            <Card key={b.id} pressable onClick={() => b.order.status === 'in_progress' && b.status === 'accepted' && navigate(routes.chat(b.order.id))}>
              <div className={styles.rowTop}>
                <BidStatusPill status={b.status as BidStatus} label={t((BID_LABEL[b.status] ?? 'status.waiting') as never)} />
              </div>
              <div className={styles.rowTitle}>{b.order.title}</div>
              <div className={styles.rowBottom} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Price amount={b.price} size="md" />
                <span className={styles.dist}>{t('specialist.youGet')}: {b.payout} ₸</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
