import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Screen, AppBar, Card, Avatar, Rating, Price, DiplomaBadge, VerifiedBadge, NewSpecialistBadge,
  Button, BidStatusPill, SkeletonBidCard, Icon, ConfirmDialog,
} from '../../components/ui';
import type { BidStatus } from '../../components/ui';
import { fetchOrder, fetchOrderBids, acceptBid, declineBid, cancelOrder, counterBid, type OrderBid } from './api';
import { PriceOfferSheet } from './PriceOfferSheet';
import { apiError } from '../../api/client';
import { formatTenge } from '../../lib/format';
import { routes } from '../../router/routes';
import styles from './OrderBids.module.scss';

const AVAIL_LABEL: Record<string, string> = {
  today: 'bidExtra.readyToday',
  tomorrow: 'bidExtra.readyTomorrow',
  this_week: 'bidExtra.readyThisWeek',
};

/** S-23/S-24: отклики на заказ + принятие (каскад) / отклонение. */
export function OrderBidsScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [counterFor, setCounterFor] = useState<OrderBid | null>(null);

  const { data: bids = [] } = useQuery({
    queryKey: ['order-bids', id],
    queryFn: () => fetchOrderBids(id),
    refetchInterval: 5000,
  });
  // Статус заказа (общий кэш с ActiveOrderScreen) — отмена доступна только пока active.
  const { data: order } = useQuery({ queryKey: ['order', id], queryFn: () => fetchOrder(id), refetchInterval: 5000 });

  const active = bids.filter((b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'countered');

  async function doCounter(price: number) {
    if (!counterFor) return;
    await counterBid(counterFor.id, price);
    await qc.invalidateQueries({ queryKey: ['order-bids', id] });
  }

  async function cancel() {
    setCancelling(true);
    setCancelError('');
    try {
      await cancelOrder(id);
      // Общий кэш с ActiveOrderScreen — сразу отражаем 'cancelled', иначе тап покажет стейл 'active'.
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['my-orders'] }),
        qc.invalidateQueries({ queryKey: ['order', id] }),
        qc.invalidateQueries({ queryKey: ['order-bids', id] }),
      ]);
      navigate(routes.clientOrders, { replace: true });
    } catch (e) {
      // Оставляем диалог открытым с видимой ошибкой (не «молчаливое» закрытие).
      setCancelling(false);
      setCancelError(apiError(e) === 'cancel_after_accept_via_support' ? t('client.cancelTooLate') : t('client.cancelError'));
    }
  }
  function closeCancel() {
    setConfirmCancel(false);
    setCancelError('');
  }

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
      {active.length === 0 ? (
        <MatchingState />
      ) : (
        <div className={styles.list}>
          {active.map((b) => (
            <BidCard key={b.id} bid={b} busy={busy === b.id} onAccept={() => accept(b)} onDecline={() => decline(b)} onCounter={() => setCounterFor(b)} />
          ))}
        </div>
      )}

      {order?.status === 'active' && (
        <button className={styles.cancelOrder} onClick={() => setConfirmCancel(true)}>{t('client.cancelOrder')}</button>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onClose={closeCancel}
        title={t('client.cancelTitle')}
        message={t('client.cancelActiveMsg')}
        error={cancelError}
        confirmLabel={t('client.cancelActiveConfirm')}
        onConfirm={cancel}
        danger
        loading={cancelling}
      />

      <PriceOfferSheet
        open={counterFor != null}
        onClose={() => setCounterFor(null)}
        title={t('client.counterTitle')}
        hint={counterFor ? t('client.counterHint', { price: formatTenge(counterFor.price) }) : undefined}
        submitLabel={t('client.counterSubmit')}
        onSubmit={doCounter}
      />
    </Screen>
  );
}

/** Экран ожидания откликов (пост-публикация): анимация поиска + скелетоны. */
function MatchingState() {
  const { t } = useTranslation();
  return (
    <div className={styles.matching}>
      <div className={styles.pulse}>
        <Icon name="search" size={30} color="var(--c-primary)" />
      </div>
      <div className={styles.matchTitle}>{t('matching.title')}</div>
      <div className={styles.matchHint}>{t('matching.hint')}</div>
      <div className={styles.counter}>{t('matching.counterZero')}</div>
      <div className={styles.skeletons}>
        <SkeletonBidCard />
        <SkeletonBidCard />
      </div>
    </div>
  );
}

/** Карточка отклика: фото, честный рейтинг/«Новый специалист», бейджи доверия, статус. */
function BidCard({ bid: b, busy, onAccept, onDecline, onCounter }: { bid: OrderBid; busy: boolean; onAccept: () => void; onDecline: () => void; onCounter: () => void }) {
  const { t } = useTranslation();
  const s = b.specialist;
  // Честный гейт: рейтинг и число заказов независимы — показываем звёзды только при
  // реальном рейтинге (rating > 0 ⟺ есть опубликованные отзывы), иначе «Новый специалист».
  const hasHistory = s.completed_orders > 0 && s.rating > 0;
  return (
    <Card className={styles.card}>
      <div className={styles.top}>
        <Avatar name={s.name ?? ''} size={48} />
        <div className={styles.info}>
          <div className={styles.name}>{s.name}</div>
          {hasHistory ? (
            <div className={styles.meta}>
              <Rating value={Math.round(s.rating)} size={14} readOnly />
              <span>{s.rating.toFixed(1)}</span>
              <span>· {t('specialist.ordersCount', { count: s.completed_orders })}</span>
            </div>
          ) : (
            <NewSpecialistBadge label={t('trust.newSpecialist')} />
          )}
          <div className={styles.badges}>
            <VerifiedBadge label={t('trust.verified')} />
            {s.diploma && <DiplomaBadge label={t('specialist.diplomaBadge')} />}
          </div>
        </div>
        <div className={styles.price}>
          <Price amount={b.price} size="md" />
          <BidStatusPill
            status={b.status as BidStatus}
            label={b.status === 'accepted' ? t('bidStatus.accepted') : b.status === 'countered' ? t('bidStatus.countered') : t('bidStatus.awaitingDecision')}
          />
        </div>
      </div>
      {(b.availability || b.has_materials || b.comment) && (
        <div className={styles.extra}>
          <div className={styles.tags}>
            {b.availability && AVAIL_LABEL[b.availability] && (
              <span className={styles.tag}>{t(AVAIL_LABEL[b.availability] as never)}</span>
            )}
            {b.has_materials && <span className={styles.tag}>{t('bidExtra.withMaterials')}</span>}
          </div>
          {b.comment && <div className={styles.comment}>{b.comment}</div>}
        </div>
      )}
      {b.status === 'pending' && (
        <>
          <div className={styles.actions}>
            <Button variant="secondary" fullWidth loading={busy} onClick={onDecline}>{t('client.decline')}</Button>
            <Button fullWidth loading={busy} onClick={onAccept}>{t('client.accept')}</Button>
          </div>
          <button className={styles.counterLink} onClick={onCounter}>{t('client.counterOffer')}</button>
        </>
      )}
      {b.status === 'countered' && b.counter_price != null && (
        <div className={styles.counteredNote}>{t('client.counteredWaiting', { price: formatTenge(b.counter_price) })}</div>
      )}
    </Card>
  );
}
