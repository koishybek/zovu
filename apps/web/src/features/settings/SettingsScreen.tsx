import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Icon, SegmentedControl, Switch } from '../../components/ui';
import { setLang, getLang, type Lang } from '../../i18n';
import { updateMe } from '../auth/api';
import { useAuthStore } from '../../store/auth';
import { usePrefsStore } from '../../store/prefs';
import { requestGeo } from '../permissions/actions';
import { routes } from '../../router/routes';
import styles from './Settings.module.scss';

/** S-35 Настройки: язык RU/KZ (НФ-02), вторая роль, общие секции, выход. */
export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const geoGranted = usePrefsStore((s) => s.perms.geoGranted);
  const setPerms = usePrefsStore((s) => s.setPerms);

  function changeLang(lang: Lang) {
    setLang(lang);
    void updateMe({ lang }).then(setUser).catch(() => {});
  }

  const bothRoles = user?.is_client && user?.is_specialist;

  return (
    <Screen>
      <AppBar showBack largeTitle={t('settings.title')} />

      <div className={styles.sectionTitle}>{t('settings.appLanguage')}</div>
      <SegmentedControl<Lang>
        segments={[
          { value: 'ru', label: t('settings.russian') },
          { value: 'kk', label: t('settings.kazakh') },
        ]}
        value={getLang() as Lang}
        onChange={changeLang}
      />

      {!bothRoles && (
        <Card pressable className={styles.row} onClick={() => navigate(routes.roleSwitch)} style={{ marginTop: 16 }}>
          <Icon name="profile" size={20} color="var(--c-primary)" />
          <span className={styles.rowLabel}>{t('role.activateSecondRole')}</span>
          <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
        </Card>
      )}

      <div className={styles.sectionTitle}>{t('settings.general')}</div>
      {[
        { icon: 'bell' as const, label: t('notifications.title'), to: routes.notifications },
        { icon: 'support' as const, label: t('support.title'), to: routes.support },
      ].map((item) => (
        <Card key={item.label} pressable className={styles.row} onClick={() => navigate(item.to)}>
          <Icon name={item.icon} size={20} color="var(--c-ink-secondary)" />
          <span className={styles.rowLabel}>{item.label}</span>
          <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
        </Card>
      ))}

      {/* Точка повторного включения гео (после «Позже» в primer). */}
      <Card className={styles.row}>
        <Icon name="pin" size={20} color="var(--c-ink-secondary)" />
        <span className={styles.rowLabel}>{t('settings.geolocation')}</span>
        <Switch checked={geoGranted} onChange={(v) => (v ? requestGeo(setPerms) : setPerms({ geoGranted: false }))} />
      </Card>

      <button className={styles.logout} onClick={() => { logout(); navigate(routes.welcome, { replace: true }); }}>
        {t('settings.logout')}
      </button>
      <div className={styles.lang}>{i18n.language.toUpperCase()}</div>
    </Screen>
  );
}
