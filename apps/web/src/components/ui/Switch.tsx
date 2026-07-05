import { haptic } from '../../lib/haptics';
import styles from './Switch.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

/** iOS-свитч (Только дипломированные, настройки). */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={[styles.track, checked ? styles.on : ''].join(' ')}
      onClick={() => {
        haptic.light();
        onChange(!checked);
      }}
    >
      <span className={styles.knob} />
    </button>
  );
}
