import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Price, OrderStatusPill, EmptyState, Button, SkeletonList } from '../../components/ui';
import type { OrderStatus } from '../../components/ui';
import { fetchMyOrders, type Order } from '../orders/api';
import { routes } from '../../router/routes';
import styles from './ClientBids.module.scss';

const STATUS_LABEL: Record<string, string> = {
  active: 'status.new',
  in_progress: 'status.inProgress',
  awaiting_confirmation: 'status.awaitingConfirmation',
  completed: 'status.done',
  completed_auto: 'status.doneAuto',
  cancelled: 'status.cancelled',
  disputed: 'status.review',
};

/** S-23-рут: «Отклики» заказчика — заказы, на которые пришли отклики. */
export function ClientBidsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    refetchInterval: 8000,
  });

  const withBids = orders.filter(
    (o) => (o as Order & { bids_count: number }).bids_count > 0 || o.status !== 'active',
  );

  return (
    <Screen onRefresh={() => refetch()}>
      <AppBar largeTitle={t('tabbar.myBids')} />
      {isLoading ? (
        <SkeletonList />
      ) : withBids.length === 0 ? (
        <EmptyState
          icon="bids"
          title={t('clientBids.emptyTitle')}
          hint={t('clientBids.emptyHint')}
          action={<Button fullWidth={false} onClick={() => navigate(routes.clientOrderNew)}>{t('client.createFirstOrder')}</Button>}
        />
      ) : (
        <div className={styles.list}>
          {withBids.map((o) => {
            const count = (o as Order & { bids_count: number }).bids_count;
            return (
              <Card
                key={o.id}
                pressable
                onClick={() =>
                  navigate(o.status === 'active' ? routes.clientOrderBids(o.id) : routes.clientOrder(o.id))
                }
              >
                <div className={styles.rowTop}>
                  <OrderStatusPill status={o.status as OrderStatus} label={t((STATUS_LABEL[o.status] ?? 'status.new') as never)} />
                </div>
                <div className={styles.rowTitle}>{o.title}</div>
                <div className={styles.rowAddr}>{o.category_name} · {o.address}</div>
                <div className={styles.rowBottom}>
                  <Price amount={o.budget} size="md" />
                  {o.status === 'active' && count > 0 && (
                    <span className={styles.received}>{t('client.bidsReceived', { count })}</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
