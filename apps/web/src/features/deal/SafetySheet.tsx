import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Icon, TextField, Button } from '../../components/ui';
import { routes } from '../../router/routes';
import styles from './Safety.module.scss';

const CONTACTS_KEY = 'zovu.trustedContacts';
function loadContacts(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CONTACTS_KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

interface SafetySheetProps {
  open: boolean;
  onClose: () => void;
  order: { id: string; title: string; address: string };
  performerName?: string | null;
}

/** Слой безопасности активного заказа (Uber-стиль): шеринг статуса, SOS 112, жалоба, доверенные контакты. */
export function SafetySheet({ open, onClose, order, performerName }: SafetySheetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<string[]>(loadContacts);
  const [newContact, setNewContact] = useState('');
  const [shareInfo, setShareInfo] = useState<'copied' | 'manual' | null>(null);

  const shareText = t('safety.shareText', { title: order.title, name: performerName || '—', address: order.address });

  async function share() {
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string }) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({ title: 'Zovu', text: shareText });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareInfo('copied');
        setTimeout(() => setShareInfo(null), 2500);
        return;
      }
      // Ни Web Share, ни clipboard (insecure http на LAN-IP) — показываем текст для ручного копирования.
      setShareInfo('manual');
    } catch {
      /* пользователь отменил шеринг — не ошибка */
    }
  }

  function persist(next: string[]) {
    setContacts(next);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(next));
  }
  function addContact() {
    const v = newContact.trim();
    if (!v || contacts.length >= 5 || contacts.includes(v)) return; // дедуп по значению
    persist([...contacts, v]);
    setNewContact('');
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('safety.shield')}>
      <p className={styles.hint}>{t('safety.hint')}</p>

      <button className={styles.tile} onClick={share}>
        <span className={[styles.tileIcon, styles.blue].join(' ')}><Icon name="shield" size={22} color="#fff" /></span>
        <span className={styles.tileLabel}>{t('safety.shareStatus')}</span>
        <Icon name="chevronRight" size={18} color="var(--c-ink-muted)" />
      </button>

      <a className={styles.tile} href="tel:112">
        <span className={[styles.tileIcon, styles.red].join(' ')}><Icon name="phone" size={20} color="#fff" /></span>
        <span className={styles.tileText}>
          <b>{t('safety.sos')}</b>
          <small>{t('safety.sosHint')}</small>
        </span>
      </a>

      <button className={styles.tile} onClick={() => { onClose(); navigate(routes.support); }}>
        <span className={[styles.tileIcon, styles.amber].join(' ')}><Icon name="flag" size={20} color="#fff" /></span>
        <span className={styles.tileLabel}>{t('safety.report')}</span>
        <Icon name="chevronRight" size={18} color="var(--c-ink-muted)" />
      </button>

      {shareInfo === 'copied' && <div className={styles.copied}>{t('safety.copied')}</div>}
      {shareInfo === 'manual' && <div className={styles.manual}>{shareText}</div>}

      <div className={styles.trustedHead}>
        {t('safety.trusted')}
        <span>{t('safety.trustedHint')}</span>
      </div>
      {contacts.length > 0 && (
        <div className={styles.contacts}>
          {contacts.map((c) => (
            <span key={c} className={styles.contact}>
              {c}
              <button aria-label={t('common.close')} onClick={() => persist(contacts.filter((x) => x !== c))}>
                <Icon name="close" size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      {contacts.length < 5 && (
        <div className={styles.addRow}>
          <TextField value={newContact} placeholder={t('safety.contactPlaceholder')} onChange={(e) => setNewContact(e.target.value)} />
          <Button fullWidth={false} onClick={addContact} disabled={!newContact.trim()}>{t('safety.addContact')}</Button>
        </div>
      )}
    </BottomSheet>
  );
}
