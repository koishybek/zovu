import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '../Icon';
import { haptic } from '../../lib/haptics';
import type { Resources } from '../../i18n/ru';
import styles from './TabBar.module.scss';

export interface TabItem {
  key: keyof Resources['tabbar'];
  path: string;
  icon: IconName;
}

/** Нижняя навигация. Активный таб — primary. Лейблы из i18n (tabbar.*). */
export function TabBar({ tabs }: { tabs: readonly TabItem[] }) {
  const { t } = useTranslation();
  return (
    <nav className={styles.bar}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.path}
          className={({ isActive }) => [styles.tab, isActive ? styles.active : ''].join(' ')}
          onClick={() => haptic.light()}
        >
          <Icon name={tab.icon} size={24} />
          <span className={styles.label}>{t(`tabbar.${tab.key}` as const)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
