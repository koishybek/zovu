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

/** Скелетон-карточка отклика (для экрана ожидания). */
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
