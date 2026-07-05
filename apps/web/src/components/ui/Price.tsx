import { formatTenge } from '../../lib/format';
import styles from './Price.module.scss';

interface PriceProps {
  amount: number;
  size?: 'lg' | 'md' | 'sm';
  muted?: boolean;
}

/** Цена ₸: крупный вес 800 (канон standalone). */
export function Price({ amount, size = 'lg', muted = false }: PriceProps) {
  return (
    <span className={[styles.price, styles[size], muted ? styles.muted : ''].join(' ')}>
      {formatTenge(amount)}
    </span>
  );
}
