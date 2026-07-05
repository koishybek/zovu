import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField, RadioRow } from '../../components/ui';
import { topup } from './api';
import { formatTenge } from '../../lib/format';
import styles from './Billing.module.scss';

const PRESETS = [1000, 2000, 5000, 10000];

/** S-16 Пополнение (мок): пресеты, способ оплаты, «Комиссия не взимается». */
export function TopupScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [amount, setAmount] = useState(2000);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState<'kaspi' | 'card'>('kaspi');
  const [loading, setLoading] = useState(false);

  const value = custom ? Number(custom.replace(/\D/g, '')) : amount;

  async function submit() {
    if (value <= 0 || loading) return;
    setLoading(true);
    try {
      await topup(value, method);
      await qc.invalidateQueries({ queryKey: ['balance'] });
      await qc.invalidateQueries({ queryKey: ['transactions'] });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen footer={<Button onClick={submit} loading={loading} disabled={value <= 0}>{t('specialist.topup')}</Button>}>
      <AppBar showBack largeTitle={t('specialist.topupBalance')} />
      <TextField
        label={t('specialist.enterAmount')}
        inputMode="numeric"
        value={custom || String(amount)}
        onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 8))}
      />
      <div className={styles.presets}>
        {PRESETS.map((p) => (
          <button
            key={p}
            className={[styles.preset, !custom && amount === p ? styles.presetOn : ''].join(' ')}
            onClick={() => { setAmount(p); setCustom(''); }}
          >
            {formatTenge(p)}
          </button>
        ))}
      </div>

      <div className={styles.methods}>
        <RadioRow checked={method === 'kaspi'} onChange={() => setMethod('kaspi')}>{t('specialist.kaspi')}</RadioRow>
        <RadioRow checked={method === 'card'} onChange={() => setMethod('card')}>{t('specialist.bankCard')}</RadioRow>
      </div>
      <div className={styles.noFee}>{t('specialist.noFee')}</div>
    </Screen>
  );
}
