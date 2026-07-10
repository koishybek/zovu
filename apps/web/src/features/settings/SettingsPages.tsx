import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Screen, AppBar, Card, Icon } from '../../components/ui';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Settings.module.scss';

const APP_VERSION = '0.2.0';

/** S-35a Безопасность: номер аккаунта, защищённый вход (OTP), выход. */
export function SecurityScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  return (
    <Screen>
      <AppBar showBack largeTitle={t('settings.security')} />
      <p className={styles.infoP}>{t('settings.securityIntro')}</p>
      <Card className={styles.infoRow}>
        <Icon name="phone" size={20} color="var(--c-ink-secondary)" />
        <span className={styles.infoLabel}>{t('settings.accountPhone')}</span>
        <span className={styles.infoValue}>{user?.phone ?? '—'}</span>
      </Card>
      <div className={styles.infoNote}>{t('settings.securityOtpNote')}</div>
      <button className={styles.logout} onClick={() => { logout(); navigate(routes.welcome, { replace: true }); }}>
        {t('settings.logout')}
      </button>
    </Screen>
  );
}

/** S-35b Конфиденциальность: какие данные собираем и как используем. */
export function PrivacyScreen() {
  const { t } = useTranslation();
  const points = t('settings.privacyPoints', { returnObjects: true }) as string[];
  return (
    <Screen>
      <AppBar showBack largeTitle={t('settings.privacy')} />
      <p className={styles.infoP}>{t('settings.privacyIntro')}</p>
      <ul className={styles.infoList}>
        {(Array.isArray(points) ? points : []).map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <div className={styles.infoNote}>{t('settings.privacyFooter')}</div>
    </Screen>
  );
}

/** S-35c О приложении: версия, описание, что это. */
export function AboutScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppBar showBack largeTitle={t('settings.about')} />
      <div className={styles.aboutHead}>
        <div className={styles.aboutLogo}>Zovu</div>
        <div className={styles.aboutVersion}>{t('settings.version', { v: APP_VERSION })}</div>
      </div>
      <p className={styles.infoP}>{t('settings.aboutDescription')}</p>
      <div className={styles.infoNote}>{t('settings.aboutCopyright')}</div>
    </Screen>
  );
}
