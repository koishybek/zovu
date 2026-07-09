import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, StatusPill, SkeletonChat, EmptyState, Rating, Icon } from '../../components/ui';
import { fetchTickets, addTicketMessage, rateTicket } from './api';
import styles from './Support.module.scss';

const ST: Record<string, { kind: 'new' | 'inProgress' | 'done'; key: string }> = {
  new: { kind: 'new', key: 'support.stNew' },
  in_progress: { kind: 'inProgress', key: 'support.stInProgress' },
  resolved: { kind: 'done', key: 'support.stResolved' },
};

/** S-31a Тред обращения: сообщения пользователя/поддержки, ответ, оценка после закрытия (СП-10). */
export function SupportTicketScreen() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['tickets'], queryFn: fetchTickets, refetchInterval: 8000 });
  const ticket = useMemo(() => tickets.find((x) => x.id === id), [tickets, id]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [rated, setRated] = useState(0);

  async function send() {
    const val = text.trim();
    if (!val || sending) return;
    setSending(true);
    try {
      await addTicketMessage(id, val);
      await qc.invalidateQueries({ queryKey: ['tickets'] });
      setText('');
    } finally {
      setSending(false);
    }
  }

  async function rate(n: number) {
    setRated(n);
    try {
      await rateTicket(id, n);
      await qc.invalidateQueries({ queryKey: ['tickets'] });
    } catch {
      setRated(0);
    }
  }

  if (isLoading && !ticket) {
    return (
      <Screen>
        <AppBar showBack largeTitle={t('support.ticketTitle')} />
        <SkeletonChat />
      </Screen>
    );
  }
  if (!ticket) {
    return (
      <Screen>
        <AppBar showBack largeTitle={t('support.ticketTitle')} />
        <EmptyState icon="support" title={t('support.ticketEmpty')} />
      </Screen>
    );
  }

  const status = ST[ticket.status] ?? ST.new;
  const resolved = ticket.status === 'resolved';
  const alreadyRated = (ticket.rating ?? 0) > 0 || rated > 0;

  return (
    <Screen
      footer={
        <div className={styles.replyBar}>
          <input
            className={styles.replyInput}
            value={text}
            placeholder={t('support.replyPlaceholder')}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className={styles.replySend} onClick={send} disabled={!text.trim() || sending} aria-label={t('common.send')}>
            <Icon name="chevronRight" size={22} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      }
    >
      <AppBar showBack largeTitle={ticket.category} trailing={<StatusPill kind={status.kind} label={t(status.key as never)} />} />

      <div className={styles.thread}>
        {ticket.messages.map((m) => (
          <div key={m.id} className={[styles.tRow, m.sender_type === 'user' ? styles.tMine : ''].join(' ')}>
            <div className={[styles.tBubble, m.sender_type === 'user' ? styles.tBubbleMine : styles.tBubbleAgent].join(' ')}>
              {m.sender_type === 'agent' && <div className={styles.tAgent}>{t('support.agent')}</div>}
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {resolved && (
        <div className={styles.rateBox}>
          {alreadyRated ? (
            <div className={styles.rateThanks}>
              <Icon name="check" size={16} color="var(--c-success)" /> {t('support.rateThanks')}
            </div>
          ) : (
            <>
              <div className={styles.rateTitle}>{t('support.rateTitle')}</div>
              <Rating value={rated} onChange={rate} size={32} />
            </>
          )}
        </div>
      )}
    </Screen>
  );
}
