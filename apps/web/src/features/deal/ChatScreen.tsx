import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Icon, Button, SkeletonChat } from '../../components/ui';
import { fetchChats, fetchMessages, confirmOrder, type ChatMessage } from './api';
import { useChatSocket } from './useChatSocket';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Chat.module.scss';

/** S-30 Чат (WS): пузыри, галочки прочтения, только текст (Ч-02). Read-only после завершения (Ч-07). */
export function ChatScreen() {
  const { t } = useTranslation();
  const { id: orderId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const myId = useAuthStore((s) => s.user?.id);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [confirming, setConfirming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: chats = [] } = useQuery({ queryKey: ['chats'], queryFn: fetchChats, refetchInterval: 5000 });
  const chat = useMemo(() => chats.find((c) => c.order.id === orderId), [chats, orderId]);
  const chatId = chat?.id;
  const closed = chat?.closed ?? false;
  // Специалист (не заказчик) подтверждает выполнение, когда заказ ждёт подтверждения (ЗВ-02).
  const canConfirm = chat && myId !== chat.order.clientId && chat.order.status === 'awaiting_confirmation';

  async function confirm() {
    setConfirming(true);
    try {
      await confirmOrder(orderId);
      await qc.invalidateQueries({ queryKey: ['chats'] });
      navigate(routes.clientOrderReview(orderId)); // специалист тоже оценивает заказчика
    } finally {
      setConfirming(false);
    }
  }

  const { data: history } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => fetchMessages(chatId!),
    enabled: !!chatId,
  });

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  const { connected, send } = useChatSocket(chatId, (m) => {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function onSend() {
    const val = text.trim();
    if (!val || closed) return;
    send(val);
    setText('');
  }

  return (
    <Screen bleed>
      <div style={{ padding: '0 16px' }}>
        <AppBar
          showBack
          title={chat?.order.title ?? t('chat.title')}
          trailing={<span className={styles.status}>{closed ? t('chat.readonly') : connected ? t('chat.online') : '…'}</span>}
        />
      </div>

      {canConfirm && (
        <div className={styles.confirmBar}>
          <span>{t('client.checkAndConfirm')}</span>
          <Button fullWidth={false} loading={confirming} onClick={confirm}>{t('common.done')}</Button>
        </div>
      )}

      <div className={styles.messages}>
        {!history && chatId && <SkeletonChat />}
        {messages.map((m) => {
          const mine = m.sender_id === myId;
          return (
            <div key={m.id} className={[styles.bubbleRow, mine ? styles.mine : ''].join(' ')}>
              <div className={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther].join(' ')}>
                {m.text}
                <span className={styles.time}>
                  {new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  {mine && <Icon name="check" size={12} strokeWidth={2.5} color={m.read ? '#fff' : 'rgba(255,255,255,0.5)'} />}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {!closed ? (
        <div className={styles.inputBar}>
          <input
            className={styles.input}
            value={text}
            placeholder={t('chat.messagePlaceholder')}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <button className={styles.sendBtn} onClick={onSend} disabled={!text.trim()}>
            <Icon name="chevronRight" size={22} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className={styles.closed}>{t('chat.readonly')}</div>
      )}
    </Screen>
  );
}
