import { type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/** Дружелюбный empty-state (пустая колода, нет откликов) — иллюстрация на primarySoft. */
export function EmptyState({ icon = 'orders', title, hint, action }: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.illo}>
        <Icon name={icon} size={40} color="var(--c-primary)" />
      </div>
      <div className={styles.title}>{title}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
