import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  /** Текущий шаг (1-based) или доля 0..1. */
  step?: number;
  total?: number;
  value?: number;
}

/** Толстый закруглённый прогресс в стиле Duolingo (онбординг специалиста, шаги 1–4). */
export function ProgressBar({ step, total, value }: ProgressBarProps) {
  const pct =
    typeof value === 'number'
      ? Math.max(0, Math.min(1, value)) * 100
      : total && step
        ? (step / total) * 100
        : 0;

  return (
    <div className={styles.track} role="progressbar" aria-valuenow={Math.round(pct)}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
