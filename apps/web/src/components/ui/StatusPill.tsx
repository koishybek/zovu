import { statusPill } from '../../theme/tokens';
import styles from './StatusPill.module.scss';

export type OrderStatus =
  | 'active'
  | 'in_progress'
  | 'awaiting_confirmation'
  | 'completed'
  | 'completed_auto'
  | 'cancelled'
  | 'disputed';

export type BidStatus = 'pending' | 'accepted' | 'declined' | 'not_selected';

type PillKind = keyof typeof statusPill;

// Маппинг доменных статусов → визуальный вид пилла (docs/06 §статус-пиллы, docs/07 §3.5).
const ORDER_KIND: Record<OrderStatus, PillKind> = {
  active: 'new',
  in_progress: 'inProgress',
  awaiting_confirmation: 'review',
  completed: 'done',
  completed_auto: 'done',
  cancelled: 'notSelected',
  disputed: 'review',
};

const BID_KIND: Record<BidStatus, PillKind> = {
  pending: 'waiting',
  accepted: 'accepted',
  declined: 'notSelected',
  not_selected: 'notSelected',
};

export function StatusPill({ kind, label }: { kind: PillKind; label: string }) {
  const c = statusPill[kind];
  return (
    <span className={styles.pill} style={{ background: c.bg, color: c.fg }}>
      {label}
    </span>
  );
}

export function OrderStatusPill({ status, label }: { status: OrderStatus; label: string }) {
  return <StatusPill kind={ORDER_KIND[status]} label={label} />;
}

export function BidStatusPill({ status, label }: { status: BidStatus; label: string }) {
  return <StatusPill kind={BID_KIND[status]} label={label} />;
}
