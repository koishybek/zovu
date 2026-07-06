import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, Button } from '../../components/ui';
import { routes } from '../../router/routes';
import { useAuthStore } from '../../store/auth';
import { devLogin } from './api';
import { DEMO_PERSONAS } from '../../lib/demo';
import styles from './WelcomeScreen.module.scss';

/** S-01 Welcome — лого, слоган, CTA «Начать». В dev — быстрый вход обеими ролями. */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [busy, setBusy] = useState<string | null>(null);

  async function quickLogin(phone: string) {
    setBusy(phone);
    try {
      const res = await devLogin(phone);
      setSession({ access_token: res.access_token, refresh_token: res.refresh_token }, res.user);
      navigate(routes.home, { replace: true });
    } catch {
      setBusy(null);
    }
  }

  return (
    <Screen footer={<Button onClick={() => navigate(routes.phone)}>{t('auth.start')}</Button>}>
      <div className={styles.hero}>
        <div className={styles.wordmark}>Zovu</div>
        <p className={styles.slogan}>{t('auth.welcomeSlogan')}</p>
      </div>

      {import.meta.env.DEV && (
        <div className={styles.dev}>
          <div className={styles.devLabel}>Быстрый вход (demo)</div>
          <div className={styles.devRow}>
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.phone}
                className={styles.devBtn}
                disabled={busy !== null}
                onClick={() => quickLogin(p.phone)}
              >
                {busy === p.phone ? '…' : p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}
