import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Avatar, Card, Icon, type IconName } from '../../components/ui';
import { fetchMe } from '../auth/api';
import { fetchMyOrders } from '../orders/api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './ClientProfile.module.scss';

interface Row {
  icon: IconName;
  label: string;
  onClick: () => void;
}

/** Профиль заказчика: имя, телефон, число заказов, переходы (роль/настройки/поддержка/выход). */
export function ClientProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: me } = useQuery({ queryKey: ['me', 'profile'], queryFn: fetchMe });
  const { data: orders = [] } = useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders });

  const rows: Row[] = [
    { icon: 'orders', label: t('tabbar.myOrders'), onClick: () => navigate(routes.clientOrders) },
    { icon: 'bell', label: t('notifications.title'), onClick: () => navigate(routes.notifications) },
    {
      icon: 'profile',
      label: user?.is_specialist ? t('role.roleSettings') : t('client.becomeSpecialist'),
      onClick: () => navigate(routes.roleSwitch),
    },
    { icon: 'support', label: t('support.title'), onClick: () => navigate(routes.support) },
    { icon: 'settings', label: t('settings.title'), onClick: () => navigate(routes.settings) },
  ];

  return (
    <Screen>
      <AppBar
        largeTitle={t('tabbar.profile')}
        trailing={
          <button
            onClick={() => {
              logout();
              navigate(routes.welcome, { replace: true });
            }}
            aria-label={t('settings.logout')}
          >
            <Icon name="logout" size={22} color="var(--c-danger)" />
          </button>
        }
      />

      <div className={styles.header}>
        <Avatar name={me?.name ?? user?.name ?? ''} size={88} />
        <div className={styles.name}>{me?.name ?? user?.name}</div>
        <div className={styles.phone}>{user?.phone}</div>
        <div className={styles.stat}>{t('client.ordersPlaced', { count: orders.length })}</div>
      </div>

      <div className={styles.list}>
        {rows.map((r) => (
          <Card key={r.label} pressable className={styles.row} onClick={r.onClick}>
            <span className={styles.rowIcon}>
              <Icon name={r.icon} size={20} color="var(--c-primary)" />
            </span>
            <span className={styles.rowLabel}>{r.label}</span>
            <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
          </Card>
        ))}
      </div>
    </Screen>
  );
}
