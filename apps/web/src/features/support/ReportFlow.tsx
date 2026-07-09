import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, TextArea, Button, Icon, Celebration } from '../../components/ui';
import { createTicket } from './api';
import styles from './Report.module.scss';

const REASONS = ['fraud', 'rude', 'noShow', 'spam', 'other'] as const;

interface ReportFlowProps {
  open: boolean;
  onClose: () => void;
  /** Что обжалуется (заказ/имя) — уходит в ТЕКСТ жалобы. НАМЕРЕННО без orderId:
   *  тикет с orderId диспьютит заказ (ЗВ-06), а жалоба на грубость/спам не должна замораживать заказ. */
  subject?: string;
}

/** Многошаговая жалоба (ОМ-03): причина → комментарий → подтверждение отправки. */
export function ReportFlow({ open, onClose, subject }: ReportFlowProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function close() {
    onClose();
    // сброс после закрытия — чтобы повторное открытие было чистым
    setTimeout(() => {
      setReason('');
      setComment('');
      setError('');
      setDone(false);
      setLoading(false);
    }, 250);
  }

  async function submit() {
    if (!reason || loading) return;
    setLoading(true);
    setError('');
    try {
      const reasonLabel = t(`report.reason_${reason}` as never);
      const text = [reasonLabel, comment.trim(), subject ? `(${subject})` : '']
        .filter(Boolean)
        .join('. ');
      await createTicket({ category: 'Жалоба', text });
      setDone(true);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={close} title={done ? undefined : t('report.title')}>
      {done ? (
        <div className={styles.done}>
          <Celebration />
          <div className={styles.doneTitle}>{t('report.successTitle')}</div>
          <div className={styles.doneHint}>{t('report.successHint')}</div>
          <Button onClick={close}>{t('common.done')}</Button>
        </div>
      ) : (
        <>
          <div className={styles.q}>{t('report.reasonTitle')}</div>
          <div className={styles.reasons}>
            {REASONS.map((r) => (
              <button
                key={r}
                className={[styles.reason, reason === r ? styles.reasonOn : ''].join(' ')}
                onClick={() => setReason(r)}
              >
                <span>{t(`report.reason_${r}` as never)}</span>
                {reason === r && <Icon name="check" size={18} color="var(--c-primary)" />}
              </button>
            ))}
          </div>
          <TextArea
            label={t('report.commentTitle')}
            maxLength={1000}
            value={comment}
            placeholder={t('report.commentPlaceholder')}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <div className={styles.err}>{error}</div>}
          <Button onClick={submit} loading={loading} disabled={!reason}>{t('report.submit')}</Button>
        </>
      )}
    </BottomSheet>
  );
}
