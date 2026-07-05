import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Icon } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './Billing.module.scss';

/** S-17 Подписка неактивна: блок при попытке отклика с балансом < 100 (БП-02/БП-06). */
export function SubscriptionLockScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Screen
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button onClick={() => navigate(routes.spTopup)}>{t('specialist.topupYourBalance')}</Button>
          <Button variant="ghost" onClick={() => navigate(routes.spBalance)}>{t('specialist.aboutSubscription')}</Button>
        </div>
      }
    >
      <AppBar showBack />
      <div className={styles.lock}>
        <div className={styles.lockIllo}>
          <Icon name="wallet" size={48} color="var(--c-primary)" />
        </div>
        <div className={styles.lockTitle}>{t('specialist.topupYourBalance')}</div>
        <div className={styles.lockHint}>{t('specialist.balanceZeroBlock')}</div>
      </div>
    </Screen>
  );
}
