import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Avatar, Rating, Price, DiplomaBadge, Button, BidStatusPill, EmptyState } from '../../components/ui';
import type { BidStatus } from '../../components/ui';
import { fetchOrderBids, acceptBid, declineBid, type OrderBid } from './api';
import { routes } from '../../router/routes';
import styles from './OrderBids.module.scss';

/** S-23/S-24: отклики на заказ + принятие (каскад) / отклонение. */
export function OrderBidsScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data: bids = [], isLoading } = useQuery({
    queryKey: ['order-bids', id],
    queryFn: () => fetchOrderBids(id),
    refetchInterval: 5000,
  });

  const active = bids.filter((b) => b.status === 'pending' || b.status === 'accepted');

  async function accept(bid: OrderBid) {
    setBusy(bid.id);
    try {
      await acceptBid(bid.id);
      await qc.invalidateQueries({ queryKey: ['order-bids', id] });
      navigate(routes.clientOrder(id));
    } finally {
      setBusy(null);
    }
  }

  async function decline(bid: OrderBid) {
    setBusy(bid.id);
    try {
      await declineBid(bid.id);
      await qc.invalidateQueries({ queryKey: ['order-bids', id] });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <AppBar showBack largeTitle={t('client.bidsReceived', { count: active.length })} />
      {isLoading ? (
        <div className={styles.center}>{t('common.loading')}</div>
      ) : active.length === 0 ? (
        <EmptyState icon="bids" title="Пока нет откликов" hint="Специалисты рядом скоро откликнутся" />
      ) : (
        <div className={styles.list}>
          {active.map((b) => (
            <Card key={b.id} className={styles.card}>
              <div className={styles.top}>
                <Avatar name={b.specialist.name ?? ''} size={48} />
                <div className={styles.info}>
                  <div className={styles.name}>{b.specialist.name}</div>
                  <div className={styles.meta}>
                    <Rating value={Math.round(b.specialist.rating)} size={14} readOnly />
                    <span>· {b.specialist.completed_orders} {t('specialist.reviews').toLowerCase()}</span>
                  </div>
                  {b.specialist.diploma && <DiplomaBadge label={t('specialist.diplomaBadge')} />}
                </div>
                <div className={styles.price}>
                  <Price amount={b.price} size="md" />
                  <BidStatusPill status={b.status as BidStatus} label={t((b.status === 'pending' ? 'status.waiting' : 'status.accepted') as never)} />
                </div>
              </div>
              {b.status === 'pending' && (
                <div className={styles.actions}>
                  <Button variant="secondary" fullWidth loading={busy === b.id} onClick={() => decline(b)}>{t('client.decline')}</Button>
                  <Button fullWidth loading={busy === b.id} onClick={() => accept(b)}>{t('client.accept')}</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
