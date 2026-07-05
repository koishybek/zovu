import { haptic } from '../../lib/haptics';
import styles from './SegmentedControl.module.scss';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}

/** iOS-сегмент (Колода/Список/Карта, табы откликов). Трек surface, активный — белый. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const activeIndex = segments.findIndex((s) => s.value === value);

  return (
    <div className={styles.track} role="tablist">
      <div
        className={styles.thumb}
        style={{
          width: `calc((100% - 8px) / ${segments.length})`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />
      {segments.map((s) => (
        <button
          key={s.value}
          role="tab"
          aria-selected={s.value === value}
          className={[styles.seg, s.value === value ? styles.active : ''].join(' ')}
          onClick={() => {
            haptic.light();
            onChange(s.value);
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
