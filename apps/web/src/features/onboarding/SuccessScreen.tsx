import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, Button, Celebration } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './Onboarding.module.scss';

/** S-08 «Верификация пройдена» — зелёный чек + confetti + haptic, CTA «Продолжить». */
export function SuccessScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Screen footer={<Button onClick={() => navigate(routes.spOrders, { replace: true })}>{t('common.next')}</Button>}>
      <div className={styles.pending}>
        <Celebration />
        <div className={styles.pendingTitle}>{t('onboarding.verificationPassed')}</div>
        <div className={styles.pendingHint}>{t('onboarding.verificationPassedHint')}</div>
      </div>
    </Screen>
  );
}
