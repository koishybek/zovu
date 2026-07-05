import { useEffect } from 'react';
import { Icon } from '../Icon';
import { haptic } from '../../lib/haptics';
import styles from './Celebration.module.scss';

const PARTICLES = [
  { c: '#4C6FFF', x: -60, y: -40, d: 0 },
  { c: '#22C55E', x: 55, y: -50, d: 40 },
  { c: '#E8981F', x: -70, y: 20, d: 80 },
  { c: '#4C6FFF', x: 65, y: 25, d: 60 },
  { c: '#E24545', x: 0, y: -70, d: 100 },
  { c: '#22C55E', x: -30, y: -65, d: 20 },
  { c: '#E8981F', x: 35, y: -60, d: 120 },
  { c: '#4C6FFF', x: -50, y: -20, d: 140 },
];

/** Зелёный чек с burst-частицами + medium haptic (S-08, S-26). */
export function Celebration({ animate = true }: { animate?: boolean }) {
  useEffect(() => {
    if (animate) haptic.success();
  }, [animate]);

  return (
    <div className={styles.wrap}>
      {animate &&
        PARTICLES.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={
              {
                background: p.c,
                '--tx': `${p.x}px`,
                '--ty': `${p.y}px`,
                animationDelay: `${p.d}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      <div className={styles.circle}>
        <Icon name="check" size={52} color="#fff" strokeWidth={3} />
      </div>
    </div>
  );
}
