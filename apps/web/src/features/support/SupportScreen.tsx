import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, Chip, TextArea, Card, StatusPill, EmptyState, SkeletonList } from '../../components/ui';
import { createTicket, fetchTickets, type Ticket } from './api';
import styles from './Support.module.scss';

const CATEGORIES = ['Заказ', 'Оплата', 'Жалоба', 'Верификация', 'Иное'];
const ST: Record<string, { kind: 'new' | 'inProgress' | 'done'; key: string }> = {
  new: { kind: 'new', key: 'Новое' },
  in_progress: { kind: 'inProgress', key: 'В работе' },
  resolved: { kind: 'done', key: 'Решено' },
};

/** S-31 Поддержка: список обращений + создание (категория, текст). */
export function SupportScreen() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [cat, setCat] = useState('Заказ');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['tickets'], queryFn: fetchTickets, refetchInterval: 8000 });

  async function submit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await createTicket({ category: cat, text: text.trim() });
      await qc.invalidateQueries({ queryKey: ['tickets'] });
      setCreating(false);
      setText('');
    } finally {
      setLoading(false);
    }
  }

  if (creating) {
    return (
      <Screen footer={<Button onClick={submit} loading={loading} disabled={!text.trim()}>{t('common.send')}</Button>}>
        <AppBar showBack onBack={() => setCreating(false)} largeTitle={t('support.newTicket')} />
        <div className={styles.cats}>
          {CATEGORIES.map((c) => <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
        <TextArea label="" maxLength={2000} value={text} placeholder="Опишите проблему…" onChange={(e) => setText(e.target.value)} />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button onClick={() => setCreating(true)}>{t('support.newTicket')}</Button>}>
      <AppBar showBack largeTitle={t('support.title')} />
      {isLoading ? (
        <SkeletonList count={4} />
      ) : tickets.length === 0 ? (
        <EmptyState icon="support" title={t('common.emptyDefault')} hint="Задайте вопрос — поддержка ответит" />
      ) : (
        <div className={styles.list}>
          {tickets.map((tk: Ticket) => (
            <Card key={tk.id}>
              <div className={styles.top}>
                <span className={styles.cat}>{tk.category}</span>
                <StatusPill kind={ST[tk.status].kind} label={ST[tk.status].key} />
              </div>
              <div className={styles.msg}>{tk.messages[tk.messages.length - 1]?.text}</div>
              {tk.messages.some((m) => m.sender_type === 'agent') && (
                <div className={styles.agentReply}>
                  Поддержка: {tk.messages.filter((m) => m.sender_type === 'agent').slice(-1)[0]?.text}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
