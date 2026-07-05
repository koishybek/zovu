import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, OtpInput, Button } from '../../components/ui';
import { requestOtp, verifyOtp } from './api';
import { apiError } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';

const RESEND_SECONDS = 45;

/** S-03 OTP — 4 ячейки, таймер повтора, TTL 2 мин. Dev-код 1111. */
export function OtpScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const phone = (location.state as { phone?: string } | null)?.phone;

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const submitting = useRef(false);

  useEffect(() => {
    if (!phone) navigate(routes.phone, { replace: true });
  }, [phone, navigate]);

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [left]);

  useEffect(() => {
    if (code.length === 4 && !submitting.current) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function submit(c: string) {
    if (!phone || submitting.current) return;
    submitting.current = true;
    setError(false);
    try {
      const res = await verifyOtp(phone, c);
      setSession({ access_token: res.access_token, refresh_token: res.refresh_token }, res.user);
      if (res.is_new_user) {
        navigate(routes.role, { replace: true });
      } else if (res.user.active_role === 'specialist') {
        navigate(routes.spOrders, { replace: true });
      } else {
        navigate(res.user.is_client ? routes.clientOrders : routes.clientOrderNew, { replace: true });
      }
    } catch (e) {
      void apiError(e);
      setError(true);
      setCode('');
    } finally {
      submitting.current = false;
    }
  }

  async function resend() {
    if (left > 0 || !phone) return;
    try {
      await requestOtp(phone);
      setLeft(RESEND_SECONDS);
      setError(false);
    } catch {
      /* игнор — таймер уже идёт */
    }
  }

  return (
    <Screen>
      <AppBar showBack largeTitle={t('auth.otpTitle')} />
      <p style={{ color: 'var(--c-ink-secondary)', marginBottom: 32 }}>{phone}</p>
      <OtpInput value={code} onChange={setCode} error={error} autoFocus />
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        {left > 0 ? (
          <span style={{ color: 'var(--c-ink-muted)' }}>
            {t('auth.resendIn', { time: `00:${String(left).padStart(2, '0')}` })}
          </span>
        ) : (
          <Button variant="ghost" fullWidth={false} onClick={resend}>
            {t('auth.resendCode')}
          </Button>
        )}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--c-ink-muted)', fontSize: 12, marginTop: 24 }}>
        dev: код всегда 1111
      </p>
    </Screen>
  );
}
