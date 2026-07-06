import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, SegmentedControl, Card, StatusPill, Price, EmptyState, Icon } from '../../components/ui';
import { OrderDeck } from './OrderDeck';
import { OrdersMap } from './OrdersMap';
import { RespondSheet } from './RespondSheet';
import { fetchFeed, hideOrder, type FeedOrder } from './api';
import { formatDistanceKm } from '../../lib/format';
import { routes } from '../../router/routes';
import { ALMATY_FALLBACK, useGeo } from '../../lib/useGeo';
import styles from './FeedScreen.module.scss';

type View = 'deck' | 'list' | 'map';

/** S-11 Лента заказов специалиста: Колода / Список / Карта. */
export function FeedScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const geo = useGeo();
  const [view, setView] = useState<View>('deck');
  const [respond, setRespond] = useState<FeedOrder | null>(null);

  const pos = geo ?? ALMATY_FALLBACK;
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => fetchFeed(pos.lat, pos.lng),
    refetchInterval: 15000,
  });

  async function onHide(o: FeedOrder) {
    await hideOrder(o.id);
    void qc.invalidateQueries({ queryKey: ['feed'] });
  }

  return (
    <Screen>
      <AppBar
        title={t('specialist.feedTitle')}
        trailing={<button onClick={() => navigate(routes.notifications)} aria-label={t('notifications.title')}><Icon name="bell" size={24} /></button>}
      />
      <div className={styles.seg}>
        <SegmentedControl<View>
          segments={[
            { value: 'deck', label: t('specialist.viewDeck') },
            { value: 'list', label: t('specialist.viewList') },
            { value: 'map', label: t('specialist.viewMap') },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {isLoading ? (
        <div className={styles.center}>{t('common.loading')}</div>
      ) : view === 'deck' ? (
        <OrderDeck
          orders={orders}
          onRespond={setRespond}
          onHide={onHide}
          onOpen={(o) => navigate(routes.spOrder(o.id))}
          onEmptyAction={() => setView('map')}
        />
      ) : view === 'list' ? (
        <OrderList orders={orders} onOpen={(o) => navigate(routes.spOrder(o.id))} />
      ) : (
        <OrdersMap orders={orders} onOpen={(o) => navigate(routes.spOrder(o.id))} />
      )}

      <RespondSheet
        order={respond}
        open={!!respond}
        onClose={() => setRespond(null)}
        onDone={() => {
          setRespond(null);
          void qc.invalidateQueries({ queryKey: ['feed'] });
        }}
      />
    </Screen>
  );
}

function OrderList({ orders, onOpen }: { orders: FeedOrder[]; onOpen: (o: FeedOrder) => void }) {
  const { t } = useTranslation();
  const fresh = orders.filter((o) => o.is_new);
  const rest = orders.filter((o) => !o.is_new);
  if (orders.length === 0) return <EmptyState title={t('common.emptyDefault')} />;

  return (
    <div className={styles.list}>
      {fresh.length > 0 && (
        <>
          <div className={styles.groupTitle}>{t('specialist.filterNew')} ({fresh.length})</div>
          {fresh.map((o) => <Row key={o.id} o={o} onOpen={onOpen} />)}
        </>
      )}
      {rest.length > 0 && fresh.length > 0 && <div className={styles.groupTitle}>{t('specialist.filterAll')}</div>}
      {rest.map((o) => <Row key={o.id} o={o} onOpen={onOpen} />)}
    </div>
  );
}

function Row({ o, onOpen }: { o: FeedOrder; onOpen: (o: FeedOrder) => void }) {
  const { t } = useTranslation();
  return (
    <Card pressable onClick={() => onOpen(o)}>
      <div className={styles.rowTop}>
        {o.is_new ? <StatusPill kind="new" label={t('status.new')} /> : <span className={styles.cat}>{o.category_name}</span>}
        {o.distance_m != null && <span className={styles.dist}>{formatDistanceKm(o.distance_m / 1000)}</span>}
      </div>
      <div className={styles.rowTitle}>{o.title}</div>
      <div className={styles.rowAddr}>{o.address}</div>
      <div className={styles.rowBottom}>
        <Price amount={o.budget} size="md" />
      </div>
    </Card>
  );
}
