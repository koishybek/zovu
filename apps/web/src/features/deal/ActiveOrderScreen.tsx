import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Price, Icon } from '../../components/ui';
import { fetchOrder } from '../orders/api';
import { completeOrder } from './api';
import { routes } from '../../router/routes';
import styles from './ActiveOrder.module.scss';

/** S-25/S-26: активный заказ заказчика — статус-баннер + «Завершить» / «Оставить отзыв». */
export function ActiveOrderScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: order } = useQuery({ queryKey: ['order', id], queryFn: () => fetchOrder(id), refetchInterval: 5000 });

  if (!order) {
    return <Screen><AppBar showBack /><div className={styles.center}>{t('common.loading')}</div></Screen>;
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

  const footer =
    order.status === 'in_progress' ? (
      <Button onClick={complete} loading={loading}>{t('client.completeOrder')}</Button>
    ) : order.status === 'completed' || order.status === 'completed_auto' ? (
      <Button onClick={() => navigate(routes.clientOrderReview(id))}>{t('client.leaveReview')}</Button>
    ) : undefined;

  return (
    <Screen footer={footer}>
      <AppBar showBack largeTitle={order.title} />
      {banner && (
        <div className={[styles.banner, styles[banner.tone]].join(' ')}>
          <Icon name={banner.icon} size={22} color={banner.iconColor} />
          <div>
            <div className={styles.bannerTitle}>{t(banner.titleKey as never)}</div>
            <div className={styles.bannerHint}>{t(banner.hintKey as never)}</div>
          </div>
        </div>
      )}
      <div className={styles.rows}>
        <Row label={t('client.budget')} value={<Price amount={order.budget} size="sm" />} />
        <Row label={t('client.address')} value={order.address} />
        <button className={styles.chatBtn} onClick={() => navigate(routes.chat(id))}>
          <Icon name="chat" size={20} color="var(--c-primary)" />
          {t('chat.title')}
          <Icon name="chevronRight" size={18} color="var(--c-ink-muted)" />
        </button>
      </div>
    </Screen>
  );
}

const BANNERS: Record<string, { tone: 'primary' | 'warning' | 'success'; icon: 'clock' | 'check' | 'orders'; iconColor: string; titleKey: string; hintKey: string } | undefined> = {
  in_progress: { tone: 'primary', icon: 'orders', iconColor: 'var(--c-primary)', titleKey: 'status.inProgress', hintKey: 'client.inProgressBanner' },
  awaiting_confirmation: { tone: 'warning', icon: 'clock', iconColor: 'var(--c-warning-ink)', titleKey: 'status.awaitingConfirmation', hintKey: 'client.checkAndConfirm' },
  completed: { tone: 'success', icon: 'check', iconColor: 'var(--c-success)', titleKey: 'status.done', hintKey: 'client.orderCompleted' },
  completed_auto: { tone: 'success', icon: 'check', iconColor: 'var(--c-success)', titleKey: 'status.doneAuto', hintKey: 'client.orderCompleted' },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}
