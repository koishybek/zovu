import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Price, OrderStatusPill, EmptyState, Button, Icon } from '../../components/ui';
import { fetchMyOrders, type Order } from './api';
import type { OrderStatus } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './FeedScreen.module.scss';

const STATUS_LABEL: Record<string, string> = {
  active: 'status.new',
  in_progress: 'status.inProgress',
  awaiting_confirmation: 'status.awaitingConfirmation',
  completed: 'status.done',
  completed_auto: 'status.doneAuto',
  cancelled: 'status.cancelled',
  disputed: 'status.review',
};

/** Мои заказы (заказчик, ИЗ-02). */
export function MyOrdersScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders, refetchInterval: 8000 });

  return (
    <Screen footer={<Button onClick={() => navigate(routes.clientOrderNew)} leadingIcon={<Icon name="plus" size={20} color="#fff" />}>{t('client.createOrder')}</Button>}>
      <AppBar largeTitle={t('tabbar.myOrders')} />
      {isLoading ? (
        <div className={styles.center}>{t('common.loading')}</div>
      ) : orders.length === 0 ? (
        <EmptyState icon="orders" title="Заказов пока нет" hint="Создайте первый заказ — специалисты рядом откликнутся" />
      ) : (
        <div className={styles.list}>
          {orders.map((o) => (
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
    </Screen>
  );
}
