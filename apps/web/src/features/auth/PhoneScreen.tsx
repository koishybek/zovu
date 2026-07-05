import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField } from '../../components/ui';
import { requestOtp } from './api';
import { apiError } from '../../api/client';
import { routes } from '../../router/routes';

/** S-02 Ввод номера — префикс +7, маска, CTA «Получить код». */
export function PhoneScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(''); // без кода страны, до 10 цифр
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatted = formatKz(digits);
  const valid = digits.length === 10;

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    setError('');
    try {
      const phone = '+7' + digits;
      await requestOtp(phone);
      navigate(routes.otp, { state: { phone } });
    } catch (e) {
      setError(apiError(e) === 'resend_too_soon' ? 'Код уже отправлен, подождите' : t('auth.phoneInvalid'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      footer={
        <Button onClick={submit} loading={loading} disabled={!valid}>
          {t('auth.getCode')}
        </Button>
      }
    >
      <AppBar showBack largeTitle={t('auth.phoneTitle')} />
      <p style={{ color: 'var(--c-ink-secondary)', marginBottom: 24 }}>{t('auth.phoneHint')}</p>
      <TextField
        prefix="+7"
        inputMode="tel"
        autoFocus
        value={formatted}
        placeholder="701 234-56-78"
        error={error || undefined}
        onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
    </Screen>
  );
}

function formatKz(d: string): string {
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean);
  if (p.length <= 1) return p.join('');
  if (p.length === 2) return `${p[0]} ${p[1]}`;
  if (p.length === 3) return `${p[0]} ${p[1]}-${p[2]}`;
  return `${p[0]} ${p[1]}-${p[2]}-${p[3]}`;
}
