import styles from './Skeleton.module.scss';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  className?: string;
}

/** Серый shimmer-блок под реальный layout (вместо спиннера «Загрузка…»). */
export function Skeleton({ width, height = 16, radius = 8, circle, className }: SkeletonProps) {
  return (
    <span
      className={[styles.sk, className].filter(Boolean).join(' ')}
      style={{
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : radius,
      }}
    />
  );
}

/** Скелетон-карточка отклика (аватар + строки + пилюля цены). */
export function SkeletonBidCard() {
  return (
    <div className={styles.card}>
      <Skeleton circle height={48} />
      <div className={styles.lines}>
        <Skeleton width="55%" height={15} />
        <Skeleton width="35%" height={12} />
      </div>
      <Skeleton width={64} height={22} radius={999} />
    </div>
  );
}

/** Скелетон-карточка списка заказов (пилюля статуса + заголовок + адрес + цена). */
export function SkeletonCard() {
  return (
    <div className={styles.listCard}>
      <Skeleton width={78} height={22} radius={999} />
      <Skeleton width="70%" height={16} />
      <Skeleton width="48%" height={12} />
      <Skeleton width={90} height={20} />
    </div>
  );
}

/** N скелетон-карточек списка. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Скелетон детального экрана (заголовок + баннер + строки). */
export function SkeletonDetail() {
  return (
    <div className={styles.detail}>
      <Skeleton width="60%" height={26} />
      <Skeleton width="100%" height={64} radius={16} />
      <Skeleton width="100%" height={20} />
      <Skeleton width="80%" height={20} />
      <Skeleton width="100%" height={52} radius={14} />
    </div>
  );
}

/** Скелетон чата (пузыри слева/справа). */
export function SkeletonChat() {
  const rows: ('l' | 'r')[] = ['l', 'r', 'l', 'r', 'l'];
  return (
    <div className={styles.chat}>
      {rows.map((side, i) => (
        <div key={i} className={side === 'r' ? styles.chatRight : styles.chatLeft}>
          <Skeleton width={`${45 + ((i * 13) % 35)}%`} height={38} radius={18} />
        </div>
      ))}
    </div>
  );
}
