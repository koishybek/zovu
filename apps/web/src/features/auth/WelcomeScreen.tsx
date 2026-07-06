import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, Button } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './WelcomeScreen.module.scss';

/** S-01 Welcome — лого, слоган, CTA «Начать». */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Screen footer={<Button onClick={() => navigate(routes.phone)}>{t('auth.start')}</Button>}>
      <div className={styles.hero}>
        <div className={styles.wordmark}>Zovu</div>
        <p className={styles.slogan}>{t('auth.welcomeSlogan')}</p>
      </div>
    </Screen>
  );
}
