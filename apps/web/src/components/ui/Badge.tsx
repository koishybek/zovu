import { type ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Badge.module.scss';

/** Бейдж «Дипломированный ✓» (ДС-*): success-обводка + чек. */
export function DiplomaBadge({ label }: { label: string }) {
  return (
    <span className={styles.diploma}>
      <Icon name="check" size={14} strokeWidth={2.5} />
      {label}
    </span>
  );
}

/** Бейдж «Личность подтверждена» (В-06): щит + success-тон. Сигнал доверия для заказчика. */
export function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className={styles.verified}>
      <Icon name="shield" size={14} strokeWidth={2.5} />
      {label}
    </span>
  );
}

/** Нейтральный бейдж «Новый специалист» — вместо фейковой 0.0/5.0 без истории. */
export function NewSpecialistBadge({ label }: { label: string }) {
  return <span className={styles.newbie}>{label}</span>;
}

/** Числовой бейдж непрочитанных (на колокольчике). */
export function CountBadge({ count, children }: { count: number; children?: ReactNode }) {
  return (
    <span className={styles.countWrap}>
      {children}
      {count > 0 && <span className={styles.count}>{count > 99 ? '99+' : count}</span>}
    </span>
  );
}
