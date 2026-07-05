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

/** Числовой бейдж непрочитанных (на колокольчике). */
export function CountBadge({ count, children }: { count: number; children?: ReactNode }) {
  return (
    <span className={styles.countWrap}>
      {children}
      {count > 0 && <span className={styles.count}>{count > 99 ? '99+' : count}</span>}
    </span>
  );
}
