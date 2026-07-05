import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { haptic } from '../../lib/haptics';
import styles from './Button.module.scss';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  children: ReactNode;
}

/**
 * CTA-кнопка. Одна primary на экран (docs/06 §4.5).
 * pressed → scale 0.97 + light haptic (§4.2). Высота 52, радиус 14.
 */
export function Button({
  variant = 'primary',
  fullWidth = true,
  loading = false,
  leadingIcon,
  children,
  onClick,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.full : '',
        className ?? '',
      ].join(' ')}
      disabled={disabled || loading}
      onClick={(e) => {
        haptic.light();
        onClick?.(e);
      }}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-label="loading" />
      ) : (
        <>
          {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
