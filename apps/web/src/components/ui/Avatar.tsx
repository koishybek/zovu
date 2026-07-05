import styles from './Avatar.module.scss';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
}

/** Аватар: фото или инициалы на primarySoft. */
export function Avatar({ name = '', src, size = 48 }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {src ? <img src={src} alt={name} className={styles.img} /> : <span>{initials || '?'}</span>}
    </div>
  );
}
