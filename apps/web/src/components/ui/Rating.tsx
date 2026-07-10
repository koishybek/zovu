import { useState } from 'react';
import { Icon } from '../Icon';
import { haptic } from '../../lib/haptics';
import styles from './Rating.module.scss';

interface RatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  /** Только показ (в карточках), без интерактива. */
  readOnly?: boolean;
  /** Цвет заполненной звезды. Дефолт — золотой (карточки/профиль); синий — на экране оценки (макет S-27). */
  color?: string;
}

/** Оценка 1–5★. Интерактив для S-27, read-only для карточек/профиля. */
export function Rating({ value, onChange, size = 36, readOnly = false, color = '#E8981F' }: RatingProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className={styles.row} role={readOnly ? undefined : 'radiogroup'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          className={styles.star}
          aria-label={`${n}`}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => {
            if (readOnly) return;
            haptic.light();
            onChange?.(n);
          }}
        >
          <Icon
            name="star"
            size={size}
            filled={n <= shown}
            color={n <= shown ? color : 'var(--c-border)'}
            strokeWidth={n <= shown ? 0 : 1.5}
          />
        </button>
      ))}
    </div>
  );
}
