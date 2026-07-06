import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Icon, RadioRow } from '../../components/ui';
import { switchRole } from '../auth/api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from '../settings/Settings.module.scss';

/** S-34 Роль: переключение/активация роли (Р-01…Р-05). */
export function RoleSwitchScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  async function pick(role: 'client' | 'specialist') {
    if (!user) return;
    if (role === 'specialist' && !user.is_specialist) {
      navigate(routes.spProfileForm); // активация: доанкетирование + верификация
      return;
    }
    const updated = await switchRole(role);
    setUser(updated);
    navigate(role === 'specialist' ? routes.spOrders : routes.clientOrders, { replace: true });
  }

  return (
    <Screen>
      <AppBar showBack largeTitle={t('role.whoOnPlatform')} />
      <Card className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, marginTop: 16 }}>
        <RadioRow checked={user?.active_role === 'client'} onChange={() => pick('client')}>{t('role.iAmClient')}</RadioRow>
        <RadioRow checked={user?.active_role === 'specialist'} onChange={() => pick('specialist')}>
          {t('role.iAmSpecialist')}
          {!user?.is_specialist && <Icon name="plus" size={16} color="var(--c-primary)" />}
        </RadioRow>
      </Card>
      <p className={styles.lang} style={{ marginTop: 16, textAlign: 'left', color: 'var(--c-ink-secondary)', fontSize: 13 }}>
        {t('role.canChangeAnytime')}
      </p>
    </Screen>
  );
}
