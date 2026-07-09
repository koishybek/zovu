import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Price, Icon, StatusTimeline, SkeletonDetail, Avatar, Rating, VerifiedBadge, ConfirmDialog } from '../../components/ui';
import { fetchOrder, fetchOrderBids, type OrderBid } from '../orders/api';
import { completeOrder } from './api';
import { createTicket } from '../support/api';
import { SafetySheet } from './SafetySheet';
import { routes } from '../../router/routes';
import styles from './ActiveOrder.module.scss';

const LIVE_STATUSES = ['in_progress', 'awaiting_confirmation'];

/** S-25/S-26: активный заказ заказчика — таймлайн + исполнитель + «Завершить» / «Оставить отзыв». */
export function ActiveOrderScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [safety, setSafety] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const { data: order } = useQuery({ queryKey: ['order', id], queryFn: () => fetchOrder(id), refetchInterval: 5000 });
  const { data: bids = [] } = useQuery({ queryKey: ['order-bids', id], queryFn: () => fetchOrderBids(id) });
  const performer = bids.find((b) => b.status === 'accepted');

  if (!order) {
    return (
      <Screen>
        <AppBar showBack />
        <SkeletonDetail />
      </Screen>
    );
  }

  const banner = BANNERS[order.status];

  async function complete() {
    setLoading(true);
    try {
      await completeOrder(id);
      await qc.invalidateQueries({ queryKey: ['order', id] });
    } finally {
      setLoading(false);
    }
  }

  // Отмена после принятия — через спор-тикет: бэкенд помечает заказ disputed (ЗВ-06).
  async function requestCancel() {
    // Защита от дубля спора: если заказ уже не «живой» (напр. вторая вкладка уже открыла спор) — не плодим тикет.
    if (order && !LIVE_STATUSES.includes(order.status)) {
      setConfirmCancel(false);
      navigate(routes.support);
      return;
    }
    setCancelling(true);
    setCancelError('');
    try {
      await createTicket({ category: 'Заказ', text: t('client.cancelTicketText'), orderId: id });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['order', id] }),
        qc.invalidateQueries({ queryKey: ['my-orders'] }),
      ]);
      setConfirmCancel(false);
      navigate(routes.support);
    } catch {
      setCancelling(false);
      setCancelError(t('client.cancelError'));
    }
  }
  function closeCancel() {
    setConfirmCancel(false);
    setCancelError('');
  }

  const footer =
    order.status === 'in_progress' ? (
      <Button onClick={complete} loading={loading}>{t('client.completeOrder')}</Button>
    ) : order.status === 'completed' || order.status === 'completed_auto' ? (
      <Button onClick={() => navigate(routes.clientOrderReview(id))}>{t('client.leaveReview')}</Button>
    ) : undefined;

  const showShield = LIVE_STATUSES.includes(order.status);

  return (
    <Screen footer={footer}>
      <AppBar
        showBack
        largeTitle={order.title}
        trailing={
          showShield ? (
            <button onClick={() => setSafety(true)} aria-label={t('safety.shield')}>
              <Icon name="shield" size={22} color="var(--c-primary)" />
            </button>
          ) : undefined
        }
      />
      {banner && (
        <div className={[styles.banner, styles[banner.tone]].join(' ')}>
          <Icon name={banner.icon} size={22} color={banner.iconColor} />
          <div>
            <div className={styles.bannerTitle}>{t(banner.titleKey as never)}</div>
            <div className={styles.bannerHint}>{t(banner.hintKey as never)}</div>
          </div>
        </div>
      )}

      <StatusTimeline status={order.status} />

      {performer && <PerformerCard bid={performer} onChat={() => navigate(routes.chat(id))} />}

      <div className={styles.rows}>
        <Row label={t('client.budget')} value={<Price amount={order.budget} size="sm" />} />
        <Row label={t('client.address')} value={order.address} />
      </div>

      {showShield && (
        <button className={styles.cancelOrder} onClick={() => setConfirmCancel(true)}>{t('client.cancelOrder')}</button>
      )}

      <SafetySheet
        open={safety}
        onClose={() => setSafety(false)}
        order={{ id, title: order.title, address: order.address }}
        performerName={performer?.specialist.name}
      />

      <ConfirmDialog
        open={confirmCancel}
        onClose={closeCancel}
        title={t('client.cancelTitle')}
        message={t('client.cancelLiveMsg')}
        error={cancelError}
        confirmLabel={t('client.cancelLiveConfirm')}
        onConfirm={requestCancel}
        loading={cancelling}
      />
    </Screen>
  );
}

/** Карточка исполнителя после принятия: фото, рейтинг, бейдж + быстрый вход в чат. */
function PerformerCard({ bid, onChat }: { bid: OrderBid; onChat: () => void }) {
  const { t } = useTranslation();
  const s = bid.specialist;
  const hasHistory = s.completed_orders > 0 && s.rating > 0;
  return (
    <div className={styles.performer}>
      <div className={styles.perfTop}>
        <Avatar name={s.name ?? ''} size={52} />
        <div className={styles.perfInfo}>
          <div className={styles.perfName}>{s.name}</div>
          {hasHistory && (
            <div className={styles.perfMeta}>
              <Rating value={Math.round(s.rating)} size={13} readOnly />
              <span>{s.rating.toFixed(1)} · {t('specialist.ordersCount', { count: s.completed_orders })}</span>
            </div>
          )}
          <div className={styles.perfBadge}><VerifiedBadge label={t('trust.verified')} /></div>
        </div>
      </div>
      <button className={styles.chatCta} onClick={onChat}>
        <Icon name="chat" size={20} color="#fff" />
        {t('chat.title')}
      </button>
    </div>
  );
}

const BANNERS: Record<string, { tone: 'primary' | 'warning' | 'success'; icon: 'clock' | 'check' | 'orders'; iconColor: string; titleKey: string; hintKey: string } | undefined> = {
  in_progress: { tone: 'primary', icon: 'orders', iconColor: 'var(--c-primary)', titleKey: 'status.inProgress', hintKey: 'client.inProgressBanner' },
  awaiting_confirmation: { tone: 'warning', icon: 'clock', iconColor: 'var(--c-warning-ink)', titleKey: 'status.awaitingConfirmation', hintKey: 'client.checkAndConfirm' },
  completed: { tone: 'success', icon: 'check', iconColor: 'var(--c-success)', titleKey: 'status.done', hintKey: 'client.orderCompleted' },
  completed_auto: { tone: 'success', icon: 'check', iconColor: 'var(--c-success)', titleKey: 'status.doneAuto', hintKey: 'client.orderCompleted' },
  disputed: { tone: 'warning', icon: 'clock', iconColor: 'var(--c-warning-ink)', titleKey: 'status.review', hintKey: 'client.disputedHint' },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}
