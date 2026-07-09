import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Price, OrderStatusPill, EmptyState, Button, Icon, SkeletonList, SegmentedControl } from '../../components/ui';
import { fetchMyOrders, type Order } from './api';
import type { OrderStatus } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './FeedScreen.module.scss';

const STATUS_LABEL: Record<string, string> = {
  active: 'status.active',
  in_progress: 'status.inProgress',
  awaiting_confirmation: 'status.awaitingConfirmation',
  completed: 'status.done',
  completed_auto: 'status.doneAuto',
  cancelled: 'status.cancelled',
  disputed: 'status.review',
};

// Фильтр истории по статусу (ИЗ-02): активные / завершённые / отменённые — клиентская фильтрация.
type OrderFilter = 'active' | 'done' | 'cancelled';
const FILTER_STATUSES: Record<OrderFilter, string[]> = {
  active: ['active', 'in_progress', 'awaiting_confirmation', 'disputed'],
  done: ['completed', 'completed_auto'],
  cancelled: ['cancelled'],
};

/** Мои заказы (заказчик, ИЗ-02). */
export function MyOrdersScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderFilter>('active');
  const { data: orders = [], isLoading, refetch } = useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders, refetchInterval: 8000 });
  const visible = orders.filter((o) => FILTER_STATUSES[filter].includes(o.status));

  return (
    <Screen onRefresh={() => refetch()} footer={<Button onClick={() => navigate(routes.clientOrderNew)} leadingIcon={<Icon name="plus" size={20} color="#fff" />}>{t('client.createOrder')}</Button>}>
      <AppBar
        largeTitle={t('tabbar.myOrders')}
        trailing={
          <button onClick={() => navigate(routes.clientMap)} aria-label={t('map.clientTitle')}>
            <Icon name="map" size={24} />
          </button>
        }
      />
      {isLoading ? (
        <SkeletonList />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="orders"
          title={t('client.emptyOrdersTitle')}
          hint={t('client.emptyOrdersHint')}
          action={<Button fullWidth={false} onClick={() => navigate(routes.clientOrderNew)}>{t('client.createFirstOrder')}</Button>}
        />
      ) : (
        <>
          <div className={styles.ordersFilter}>
            <SegmentedControl<OrderFilter>
              segments={[
                { value: 'active', label: t('client.ordersFilterActive') },
                { value: 'done', label: t('client.ordersFilterDone') },
                { value: 'cancelled', label: t('client.ordersFilterCancelled') },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          {visible.length === 0 ? (
            <EmptyState
              icon="orders"
              title={t(filter === 'done' ? 'client.emptyDoneTitle' : filter === 'cancelled' ? 'client.emptyCancelledTitle' : 'client.emptyOrdersTitle')}
              hint={filter === 'active' ? t('client.emptyOrdersHint') : undefined}
              action={filter === 'active' ? <Button fullWidth={false} onClick={() => navigate(routes.clientOrderNew)}>{t('client.createFirstOrder')}</Button> : undefined}
            />
          ) : (
            <div className={styles.list}>
              {visible.map((o) => (
            <Card key={o.id} pressable onClick={() => navigate(o.status === 'active' ? routes.clientOrderBids(o.id) : routes.clientOrder(o.id))}>
              <div className={styles.rowTop}>
                <OrderStatusPill status={o.status as OrderStatus} label={t((STATUS_LABEL[o.status] ?? 'status.new') as never)} />
                {o.status === 'active' && (o as Order & { bids_count: number }).bids_count > 0 && (
                  <span className={styles.cat}>{t('client.bidsReceived', { count: (o as Order & { bids_count: number }).bids_count })}</span>
                )}
              </div>
              <div className={styles.rowTitle}>{o.title}</div>
              <div className={styles.rowAddr}>{o.category_name} · {o.address}</div>
              <div className={styles.rowBottom}><Price amount={o.budget} size="md" /></div>
            </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
