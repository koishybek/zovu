import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, Button, Icon } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import { routes } from '../../router/routes';
import styles from './Onboarding.module.scss';

/** S-08 «Верификация пройдена» — зелёный чек + haptic, CTA «Продолжить». */
export function SuccessScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    haptic.success();
  }, []);

  return (
    <Screen footer={<Button onClick={() => navigate(routes.spOrders, { replace: true })}>{t('common.next')}</Button>}>
      <div className={styles.pending}>
        <div className={[styles.illo, styles.success].join(' ')}>
          <Icon name="check" size={56} color="#fff" strokeWidth={3} />
        </div>
        <div className={styles.pendingTitle}>{t('onboarding.verificationPassed')}</div>
        <div className={styles.pendingHint}>{t('onboarding.verificationPassedHint')}</div>
      </div>
    </Screen>
  );
}
