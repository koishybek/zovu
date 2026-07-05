import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Icon } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './RoleScreen.module.scss';

/** S-04 Кто вы? — карточки «Я заказчик» / «Я специалист». */
export function RoleScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Screen>
      <AppBar largeTitle={t('role.whoAreYou')} />
      <div className={styles.cards}>
        <Card pressable className={styles.card} onClick={() => navigate(routes.clientName)}>
          <div className={styles.icon}>
            <Icon name="orders" size={28} color="var(--c-primary)" />
          </div>
          <div className={styles.label}>{t('role.iAmClient')}</div>
          <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
        </Card>
        <Card pressable className={styles.card} onClick={() => navigate(routes.spProfileForm)}>
          <div className={styles.icon}>
            <Icon name="profile" size={28} color="var(--c-primary)" />
          </div>
          <div className={styles.label}>{t('role.iAmSpecialist')}</div>
          <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
        </Card>
      </div>
    </Screen>
  );
}
