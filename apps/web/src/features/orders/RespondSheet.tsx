import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, RadioRow, TextField, TextArea, Chip, Switch, Price } from '../../components/ui';
import { commission, payout, formatTenge } from '../../lib/format';
import { createBid, type BidAvailability } from './api';
import { apiError } from '../../api/client';
import { routes } from '../../router/routes';
import type { FeedOrder, Order } from './api';

const COMMISSION_PCT = 5; // ADR-001, для предпросмотра; сервер пересчитывает авторитетно

const AVAILABILITY: { value: BidAvailability; key: 'avToday' | 'avTomorrow' | 'avThisWeek' }[] = [
  { value: 'today', key: 'avToday' },
  { value: 'tomorrow', key: 'avTomorrow' },
  { value: 'this_week', key: 'avThisWeek' },
];

/** S-13 Отклик: цена + структурированные поля (когда готов / материалы / питч) + «Вы получите». */
export function RespondSheet({
  order,
  open,
  onClose,
  onDone,
}: {
  order: Order | FeedOrder | null;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'accept' | 'own'>('accept');
  const [own, setOwn] = useState('');
  const [availability, setAvailability] = useState<BidAvailability | undefined>('today');
  const [hasMaterials, setHasMaterials] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;
  const price = mode === 'accept' ? order.budget : Number(own.replace(/\D/g, '')) || 0;

  async function submit() {
    if (!order || loading || price <= 0) return;
    setLoading(true);
    setError('');
    try {
      await createBid(order.id, { price, availability, hasMaterials, comment: comment.trim() || undefined });
      onDone();
    } catch (e) {
      const code = apiError(e);
      if (code === 'subscription_inactive') {
        onClose();
        navigate(routes.spSubscriptionLock); // S-17 (БП-02)
        return;
      }
      setError(code === 'not_verified' ? 'Сначала пройдите верификацию' : code === 'own_order' ? 'Это ваш заказ' : 'Не удалось отправить отклик');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('specialist.respond')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-ink-secondary)' }}>
        <span>{order.title}</span>
        <Price amount={order.budget} size="sm" muted />
      </div>

      <RadioRow checked={mode === 'accept'} onChange={() => setMode('accept')}>
        {t('specialist.acceptPrice')} · <Price amount={order.budget} size="sm" />
      </RadioRow>
      <RadioRow checked={mode === 'own'} onChange={() => setMode('own')}>
        {t('specialist.proposeOwn')}
      </RadioRow>

      {mode === 'own' && (
        <TextField
          inputMode="numeric"
          autoFocus
          value={own}
          placeholder={t('specialist.yourPrice')}
          onChange={(e) => setOwn(e.target.value.replace(/\D/g, '').slice(0, 8))}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
        <Row label={t('specialist.serviceCommission')} value={`− ${formatTenge(commission(price, COMMISSION_PCT))}`} />
        <Row label={t('specialist.youGet')} value={formatTenge(payout(price, COMMISSION_PCT))} strong />
      </div>

      {/* Структурированный отклик: сравнимость на S-23 */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-ink)' }}>{t('specialist.whenReady')}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {AVAILABILITY.map((a) => (
          <Chip key={a.value} selected={availability === a.value} onClick={() => setAvailability(a.value)}>
            {t(`specialist.${a.key}` as const)}
          </Chip>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 14 }}>{t('specialist.hasMaterialsLabel')}</span>
        <Switch checked={hasMaterials} onChange={setHasMaterials} />
      </div>

      <TextArea maxLength={200} value={comment} placeholder={t('specialist.pitchPlaceholder')} onChange={(e) => setComment(e.target.value)} />

      {mode === 'own' && price > order.budget * 1.2 && (
        <div style={{ fontSize: 12, color: 'var(--c-warning-ink)', fontWeight: 600 }}>{t('specialist.priceHighWarning')}</div>
      )}
      {error && <div style={{ color: 'var(--c-danger)', fontSize: 13 }}>{error}</div>}
      <div style={{ fontSize: 12, color: 'var(--c-ink-muted)' }}>{t('specialist.clientWillDecide')}</div>
      <Button onClick={submit} loading={loading} disabled={price <= 0}>
        {t('specialist.respond')}
      </Button>
    </BottomSheet>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: strong ? 700 : 400, color: strong ? 'var(--c-ink)' : 'var(--c-ink-secondary)' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
