import { type ReactNode } from 'react';
import { Icon } from '../Icon';
import { haptic } from '../../lib/haptics';
import styles from './Choice.module.scss';

interface RowProps {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  trailing?: ReactNode;
}

/** Radio-строка (способ оплаты S-16, «Принять/Предложить» S-13). Единичный выбор. */
export function RadioRow({ checked, onChange, children, trailing }: RowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={[styles.row, checked ? styles.selected : ''].join(' ')}
      onClick={() => {
        haptic.light();
        onChange();
      }}
    >
      <span className={[styles.radio, checked ? styles.radioOn : ''].join(' ')}>
        {checked && <span className={styles.dot} />}
      </span>
      <span className={styles.label}>{children}</span>
      {trailing}
    </button>
  );
}

/** Checkbox-строка (мультивыбор). */
export function CheckboxRow({ checked, onChange, children, trailing }: RowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={[styles.row, checked ? styles.selected : ''].join(' ')}
      onClick={() => {
        haptic.light();
        onChange();
      }}
    >
      <span className={[styles.check, checked ? styles.checkOn : ''].join(' ')}>
        {checked && <Icon name="check" size={16} strokeWidth={3} color="#fff" />}
      </span>
      <span className={styles.label}>{children}</span>
      {trailing}
    </button>
  );
}
