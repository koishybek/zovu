import { Outlet } from 'react-router-dom';
import styles from './DeviceFrame.module.scss';

/**
 * Рамка «телефона»: белая колонка ≤440px по центру на surface-фоне.
 * Корневой layout роутера — все экраны живут внутри одной рамки.
 * На десктопе (демо в 2 вкладки) выглядит как устройство.
 */
export function DeviceFrame() {
  return (
    <div className={styles.frame}>
      <Outlet />
    </div>
  );
}
