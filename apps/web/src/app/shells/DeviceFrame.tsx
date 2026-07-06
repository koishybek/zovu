import { Outlet } from 'react-router-dom';
import { StatusBar } from './StatusBar';
import styles from './DeviceFrame.module.scss';

/**
 * Рамка «телефона»: статусбар (9:41) сверху, home-индикатор снизу, контент между.
 * Корневой layout роутера — все экраны живут внутри одной рамки и выглядят как единое iOS-приложение.
 */
export function DeviceFrame() {
  return (
    <div className={styles.frame}>
      <StatusBar />
      <div className={styles.content}>
        <Outlet />
      </div>
      <div className={styles.home}>
        <span className={styles.homeBar} />
      </div>
    </div>
  );
}
