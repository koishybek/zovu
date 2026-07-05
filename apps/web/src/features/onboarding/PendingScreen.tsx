import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Icon } from '../../components/ui';
import { fetchMe } from '../auth/api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Onboarding.module.scss';

/** S-07 «Проверяем ваши данные» — polling /me, при approved → S-08. */
export function PendingScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const { data } = useQuery({
    queryKey: ['me', 'verification'],
    queryFn: fetchMe,
    refetchInterval: 2000,
  });

  const status = (data?.specialist_profile as { verificationStatus?: string } | null)?.verificationStatus;

  useEffect(() => {
    if (status === 'approved' && data) {
      setUser(data);
      navigate(routes.spSuccess, { replace: true });
    }
  }, [status, data, setUser, navigate]);

  return (
    <Screen>
      <AppBar />
      <div className={styles.pending}>
        <div className={styles.illo}>
          <Icon name="clock" size={48} color="var(--c-primary)" />
        </div>
        <div className={styles.pendingTitle}>{t('onboarding.checkingData')}</div>
        <div className={styles.pendingHint}>{t('onboarding.checkingHint')}</div>
      </div>
    </Screen>
  );
}
