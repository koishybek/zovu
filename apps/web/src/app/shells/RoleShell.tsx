import { Outlet } from 'react-router-dom';
import { TabBar, type TabItem } from '../../components/ui';
import styles from './RoleShell.module.scss';

/** Shell с таббаром для роли (специалист / заказчик). Контент — вложенный Outlet. */
export function RoleShell({ tabs }: { tabs: readonly TabItem[] }) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>
        <Outlet />
      </div>
      <TabBar tabs={tabs} />
    </div>
  );
}
