import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Avatar, EmptyState, SkeletonList } from '../../components/ui';
import { fetchChats } from '../deal/api';
import { routes } from '../../router/routes';
import styles from './ClientChats.module.scss';

/** «Чаты» заказчика: список активных диалогов по заказам (Ч-06). */
export function ClientChatsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: chats = [], isLoading, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
    refetchInterval: 8000,
  });

  return (
    <Screen onRefresh={() => refetch()}>
      <AppBar largeTitle={t('tabbar.chats')} />
      {isLoading ? (
        <SkeletonList />
      ) : chats.length === 0 ? (
        <EmptyState icon="chat" title={t('clientChats.emptyTitle')} hint={t('clientChats.emptyHint')} />
      ) : (
        <div className={styles.list}>
          {chats.map((c) => (
            <Card key={c.id} pressable className={styles.row} onClick={() => navigate(routes.chat(c.id))}>
              <Avatar name={c.order.title} size={48} />
              <div className={styles.body}>
                <div className={styles.title}>{c.order.title}</div>
                <div className={styles.last}>{c.last_message ?? t('clientChats.noMessages')}</div>
              </div>
              {c.unread > 0 && <span className={styles.unread}>{c.unread > 99 ? '99+' : c.unread}</span>}
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
