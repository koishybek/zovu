import { useRef, useState, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';
import styles from './Screen.module.scss';

interface ScreenProps {
  children: ReactNode;
  /** Нижняя CTA-панель, приклеенная к низу экрана. */
  footer?: ReactNode;
  /** Убрать боковые паддинги (для карт/списков во всю ширину). */
  bleed?: boolean;
  scroll?: boolean;
  /** Pull-to-refresh: потяните список вниз у верха → вызов onRefresh (тач-устройства). */
  onRefresh?: () => Promise<unknown> | void;
}

const THRESHOLD = 64;
const MAX_PULL = 90;

/**
 * Мобильный контейнер экрана. Колонка телефонной ширины (max 440), белый фон,
 * safe-area снизу. На десктопе (демо в 2 вкладки) выглядит как телефон.
 */
export function Screen({ children, footer, bleed = false, scroll = true, onRefresh }: ScreenProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [animate, setAnimate] = useState(false);
  const enabled = !!onRefresh && scroll;

  function onTouchStart(e: ReactTouchEvent) {
    if (!enabled || refreshing) return;
    const el = bodyRef.current;
    startY.current = el && el.scrollTop <= 0 ? e.touches[0].clientY : null;
    setAnimate(false);
  }
  function onTouchMove(e: ReactTouchEvent) {
    if (startY.current == null || refreshing) return;
    const el = bodyRef.current;
    if (!el || el.scrollTop > 0) {
      startY.current = null;
      setPull(0);
      return;
    }
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(dy * 0.5, MAX_PULL));
  }
  async function onTouchEnd() {
    if (startY.current == null) return;
    const shouldRefresh = pull >= THRESHOLD;
    startY.current = null;
    setAnimate(true);
    if (shouldRefresh && onRefresh) {
      setRefreshing(true);
      setPull(46);
      try {
        await onRefresh();
      } catch {
        /* ошибка обновления не должна ронять жест — тихо снимаем спиннер */
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }

  return (
    <div className={styles.frame}>
      <div
        ref={bodyRef}
        className={[styles.body, bleed ? styles.bleed : '', scroll ? styles.scroll : ''].join(' ')}
        onTouchStart={enabled ? onTouchStart : undefined}
        onTouchMove={enabled ? onTouchMove : undefined}
        onTouchEnd={enabled ? onTouchEnd : undefined}
        onTouchCancel={enabled ? onTouchEnd : undefined}
      >
        {enabled && (pull > 0 || refreshing) && (
          <div className={styles.ptr} style={{ opacity: Math.min(pull / THRESHOLD, 1) }}>
            <span
              className={[styles.spinner, refreshing ? styles.spinning : ''].join(' ')}
              style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
            />
          </div>
        )}
        <div className={animate ? styles.animate : ''} style={pull ? { transform: `translateY(${pull}px)` } : undefined}>
          {children}
        </div>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
