import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Icon } from '../../components/ui';
import { switchRole } from '../auth/api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Role.module.scss';

/** S-34 Роль: сегмент-переключатель «Я заказчик / Я специалист» (Р-01…Р-05). */
export function RoleSwitchScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  async function pick(role: 'client' | 'specialist') {
    if (!user) return;
    if (role === 'specialist' && !user.is_specialist) {
      navigate(routes.spProfileForm);
      return;
    }
    const updated = await switchRole(role);
    setUser(updated);
    navigate(role === 'specialist' ? routes.spOrders : routes.clientOrders, { replace: true });
  }

  const active = user?.active_role;

  return (
    <Screen>
      <AppBar showBack title={t('role.roleSettings').split(' ')[0]} />
      <h1 className={styles.title}>{t('role.whoOnPlatform')}</h1>

      <div className={styles.toggle}>
        <button className={[styles.opt, active === 'client' ? styles.optOn : ''].join(' ')} onClick={() => pick('client')}>
          <div className={styles.optIcon}><Icon name="profile" size={26} /></div>
          {t('role.iAmClient')}
        </button>
        <button className={[styles.opt, active === 'specialist' ? styles.optOn : ''].join(' ')} onClick={() => pick('specialist')}>
          <div className={styles.optIcon}><Icon name="bids" size={24} /></div>
          {t('role.iAmSpecialist')}
        </button>
      </div>

      <Card pressable className={styles.settingsRow} onClick={() => navigate(routes.settings)}>
        <Icon name="settings" size={22} color="var(--c-ink-secondary)" />
        <span>{t('role.roleSettings')}</span>
        <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
      </Card>

      <p className={styles.hint}>{t('role.canChangeAnytime')}</p>
    </Screen>
  );
}
