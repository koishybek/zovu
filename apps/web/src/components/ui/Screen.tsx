import { type ReactNode } from 'react';
import styles from './Screen.module.scss';

interface ScreenProps {
  children: ReactNode;
  /** Нижняя CTA-панель, приклеенная к низу экрана. */
  footer?: ReactNode;
  /** Убрать боковые паддинги (для карт/списков во всю ширину). */
  bleed?: boolean;
  scroll?: boolean;
}

/**
 * Мобильный контейнер экрана. Колонка телефонной ширины (max 440), белый фон,
 * safe-area снизу. На десктопе (демо в 2 вкладки) выглядит как телефон.
 */
export function Screen({ children, footer, bleed = false, scroll = true }: ScreenProps) {
  return (
    <div className={styles.frame}>
      <div className={[styles.body, bleed ? styles.bleed : '', scroll ? styles.scroll : ''].join(' ')}>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
