import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Price, Icon } from '../../components/ui';
import { RespondSheet } from './RespondSheet';
import { fetchOrder } from './api';
import styles from './OrderDetail.module.scss';

/** S-12 Карточка заказа (специалист) + CTA «Откликнуться» (S-13). */
export function OrderDetailScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const [respond, setRespond] = useState(false);
  const { data: order, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => fetchOrder(id) });

  if (isLoading || !order) {
    return (
      <Screen>
        <AppBar showBack />
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--c-ink-muted)' }}>{t('common.loading')}</div>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button onClick={() => setRespond(true)}>{t('specialist.respond')}</Button>}>
      <AppBar showBack />
      <div className={styles.photo}>
        <Icon name="orders" size={48} color="var(--c-primary)" />
      </div>
      <span className={styles.chip}>{order.category_name}</span>
      <div className={styles.title}>{order.title}</div>
      <Price amount={order.budget} size="lg" />

      <div className={styles.rows}>
        <Line icon="pin" text={order.address} />
        <div className={styles.section}>
          <div className={styles.label}>{t('specialist.description')}</div>
          <div className={styles.desc}>{order.description}</div>
        </div>
      </div>

      <RespondSheet order={order} open={respond} onClose={() => setRespond(false)} onDone={() => setRespond(false)} />
    </Screen>
  );
}

function Line({ icon, text }: { icon: 'pin'; text: string }) {
  return (
    <div className={styles.line}>
      <Icon name={icon} size={18} color="var(--c-ink-muted)" />
      <span>{text}</span>
    </div>
  );
}
