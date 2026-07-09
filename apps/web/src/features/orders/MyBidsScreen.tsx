import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Price, BidStatusPill, EmptyState, ErrorState, Button, SkeletonList, SegmentedControl } from '../../components/ui';
import type { BidStatus } from '../../components/ui';
import { formatTenge } from '../../lib/format';
import { fetchMyBids, type MyBid } from './api';
import { routes } from '../../router/routes';
import styles from './FeedScreen.module.scss';

const BID_LABEL: Record<string, string> = {
  pending: 'bidStatus.sent',
  accepted: 'bidStatus.accepted',
  not_selected: 'bidStatus.notSelected',
  declined: 'bidStatus.declined',
};

// Группировка откликов по стадии (S-14, п.12): В работе / Ожидают решения / Архив.
type BidTab = 'active' | 'pending' | 'archive';
const TABS: BidTab[] = ['active', 'pending', 'archive'];
// «Живой» заказ, где сделка ещё идёт — включая disputed: во время спора чат нужнее всего,
// поэтому спорная принятая сделка остаётся в «В работе» и открывается в чат, а не уходит в архив.
const LIVE = ['in_progress', 'awaiting_confirmation', 'disputed'];
function tabOf(b: MyBid): BidTab {
  if (b.status === 'accepted') return LIVE.includes(b.order.status) ? 'active' : 'archive';
  if (b.status === 'pending') return 'pending';
  return 'archive'; // not_selected, declined
}
/** Открывается только у активной сделки (есть чат) — иначе карточка не «обманывает» нажимаемостью. */
function isOpenable(b: MyBid): boolean {
  return b.status === 'accepted' && LIVE.includes(b.order.status);
}

/** S-14 Отклики специалиста — сгруппированы по стадии. */
export function MyBidsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paramTab = params.get('tab');
  const [tab, setTab] = useState<BidTab>(TABS.includes(paramTab as BidTab) ? (paramTab as BidTab) : 'active');
  // Диплинк (push «Не выбран» → ?tab=archive) должен переключать таб и когда экран уже открыт.
  useEffect(() => {
    if (paramTab && TABS.includes(paramTab as BidTab)) setTab(paramTab as BidTab);
  }, [paramTab]);
  const { data: bids = [], isLoading, isError, refetch } = useQuery({ queryKey: ['my-bids'], queryFn: fetchMyBids, refetchInterval: 8000 });

  const visible = bids.filter((b) => tabOf(b) === tab);

  return (
    <Screen onRefresh={() => refetch()}>
      <AppBar largeTitle={t('tabbar.bids')} />
      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : bids.length === 0 ? (
        <EmptyState
          icon="bids"
          title={t('specialist.emptyBidsTitle')}
          hint={t('specialist.emptyBidsHint')}
          action={<Button fullWidth={false} onClick={() => navigate(routes.spOrders)}>{t('specialist.viewOrders')}</Button>}
        />
      ) : (
        <>
          <div className={styles.ordersFilter}>
            <SegmentedControl<BidTab>
              segments={[
                { value: 'active', label: t('specialist.bidsTabActive') },
                { value: 'pending', label: t('specialist.bidsTabPending') },
                { value: 'archive', label: t('specialist.bidsTabArchive') },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
          {visible.length === 0 ? (
            <EmptyState icon="bids" title={t(`specialist.bidsEmpty_${tab}` as never)} />
          ) : (
            <div className={styles.list}>
              {visible.map((b) => {
                const openable = isOpenable(b);
                return (
                  <Card key={b.id} pressable={openable} onClick={openable ? () => navigate(routes.chat(b.order.id)) : undefined}>
                    <div className={styles.rowTop}>
                      <BidStatusPill status={b.status as BidStatus} label={t((BID_LABEL[b.status] ?? 'bidStatus.sent') as never)} />
                    </div>
                    <div className={styles.rowTitle}>{b.order.title}</div>
                    <div className={styles.rowBottom} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Price amount={b.price} size="md" />
                      <span className={styles.dist}>{t('specialist.youGet')}: {formatTenge(b.payout)}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
