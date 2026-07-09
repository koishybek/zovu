import { type ReactNode, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: ReactNode;
  error?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
  loading?: boolean;
}

/**
 * Центрированный alert для подтверждения действий (в т.ч. деструктивных).
 * Во время loading все пути закрытия (бэкдроп/Esc/кнопки) заблокированы. Фокус переносится
 * в диалог, Tab заперт внутри, при закрытии возвращается на триггер (a11y alertdialog).
 */
export function ConfirmDialog({ open, onClose, title, message, error, confirmLabel, cancelLabel, onConfirm, danger, loading }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const msgId = useId();

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (!loading) onClose(); // как и бэкдроп — не закрываем посреди запроса
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose, loading]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={loading ? undefined : onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? msgId : undefined}
        tabIndex={-1}
      >
        <div id={titleId} className={styles.title}>{title}</div>
        {message && <div id={msgId} className={styles.message}>{message}</div>}
        {error && <div className={styles.error} role="alert">{error}</div>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel ?? t('common.cancel')}</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
