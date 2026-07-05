import { type ReactNode } from 'react';
import { haptic } from '../../lib/haptics';
import styles from './Chip.module.scss';

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
}

/** Фильтр-чип «Новые (N)» / «Рядом» / «Все», выбор категории. Радиус 999. */
export function Chip({ selected = false, onClick, children, count }: ChipProps) {
  return (
    <button
      className={[styles.chip, selected ? styles.selected : ''].join(' ')}
      onClick={() => {
        haptic.light();
        onClick?.();
      }}
      aria-pressed={selected}
    >
      {children}
      {typeof count === 'number' && <span className={styles.count}>{count}</span>}
    </button>
  );
}
