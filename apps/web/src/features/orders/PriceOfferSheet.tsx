import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, TextField, Button } from '../../components/ui';
import styles from './PriceOffer.module.scss';

interface PriceOfferSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  initialPrice?: number;
  submitLabel: string;
  onSubmit: (price: number) => Promise<void>;
}

/** Ввод цены (контрофер заказчика / встречный отклик специалиста). Общий для обеих сторон. */
export function PriceOfferSheet({ open, onClose, title, hint, initialPrice, submitLabel, onSubmit }: PriceOfferSheetProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Каждое открытие — свежее значение (компонент переиспользуется под разные предложения).
  useEffect(() => {
    if (open) {
      setValue(initialPrice ? String(initialPrice) : '');
      setError('');
      setLoading(false);
    }
  }, [open, initialPrice]);

  const price = Number(value);

  async function submit() {
    if (!(price > 0) || loading) return;
    setLoading(true);
    setError('');
    try {
      await onSubmit(price);
      onClose();
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {hint && <p className={styles.hint}>{hint}</p>}
      <TextField
        label={t('client.budget')}
        inputMode="numeric"
        value={value}
        placeholder="0"
        onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 8))}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      {error && <div className={styles.error}>{error}</div>}
      <Button onClick={submit} loading={loading} disabled={!(price > 0)}>{submitLabel}</Button>
    </BottomSheet>
  );
}
