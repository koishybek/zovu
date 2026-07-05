import styles from './Slider.module.scss';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  label?: string;
}

/** Слайдер (фильтр «Расстояние» S-21, «Мин. рейтинг» S-21). Заливка primary до ползунка. */
export function Slider({ value, min, max, step = 1, onChange, formatValue, label }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.wrap}>
      {(label || formatValue) && (
        <div className={styles.head}>
          {label && <span className={styles.label}>{label}</span>}
          {formatValue && <span className={styles.value}>{formatValue(value)}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.input}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
