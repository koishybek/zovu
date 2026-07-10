import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Card, Price, BidStatusPill, EmptyState, ErrorState, Button, SkeletonList, SegmentedControl } from '../../components/ui';
import type { BidStatus } from '../../components/ui';
import { formatTenge, payout } from '../../lib/format';
import { fetchMyBids, acceptCounterBid, createBid, type MyBid } from './api';
import { PriceOfferSheet } from './PriceOfferSheet';
import { apiError } from '../../api/client';
import { routes } from '../../router/routes';
import styles from './FeedScreen.module.scss';

const COMMISSION_PCT = 5; // ADR-001; синхронно с backend ORDER_COMMISSION_PCT (дефолт 5)

const BID_LABEL: Record<string, string> = {
  pending: 'bidStatus.sent',
  countered: 'bidStatus.countered',
  accepted: 'bidStatus.accepted',
  not_selected: 'bidStatus.notSelected',
  declined: 'bidStatus.declined',
};

// Табы откликов (S-14, макет «Статусы откликов»): Все / Активные / Завершённые.
type BidTab = 'all' | 'active' | 'done';
const TABS: BidTab[] = ['all', 'active', 'done'];
// «Живой» заказ, где сделка ещё идёт — включая disputed: во время спора чат нужнее всего.
const LIVE = ['in_progress', 'awaiting_confirmation', 'disputed'];
/** Активный отклик = ещё в игре: pending/countered (ждёт решения) или принятый на живом заказе. */
function isActive(b: MyBid): boolean {
  if (b.status === 'pending' || b.status === 'countered') return true;
  if (b.status === 'accepted') return LIVE.includes(b.order.status);
  return false; // not_selected, declined, принятый на завершённом заказе
}
function inTab(b: MyBid, tab: BidTab): boolean {
  if (tab === 'all') return true;
  return tab === 'active' ? isActive(b) : !isActive(b);
}
/** Открывается только у активной сделки (есть чат) — иначе карточка не «обманывает» нажимаемостью. */
function isOpenable(b: MyBid): boolean {
  return b.status === 'accepted' && LIVE.includes(b.order.status);
}

/** S-14 Отклики специалиста — сгруппированы по стадии. */
export function MyBidsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const paramTab = params.get('tab');
  const [tab, setTab] = useState<BidTab>(TABS.includes(paramTab as BidTab) ? (paramTab as BidTab) : 'all');
  const [busy, setBusy] = useState<string | null>(null);
  const [reCounterFor, setReCounterFor] = useState<MyBid | null>(null);
  // Диплинк (push «Не выбран» → ?tab=done) должен переключать таб и когда экран уже открыт.
  useEffect(() => {
    if (paramTab && TABS.includes(paramTab as BidTab)) setTab(paramTab as BidTab);
  }, [paramTab]);
  const { data: bids = [], isLoading, isError, refetch } = useQuery({ queryKey: ['my-bids'], queryFn: fetchMyBids, refetchInterval: 8000 });

  const visible = bids.filter((b) => inTab(b, tab));

  // G6: специалист принимает встречную цену заказчика → сделка закрывается, идём в чат.
  async function acceptCounter(b: MyBid) {
    setBusy(b.id);
    try {
      await acceptCounterBid(b.id);
      await qc.invalidateQueries({ queryKey: ['my-bids'] });
      navigate(routes.chat(b.order.id));
    } finally {
      setBusy(null);
    }
  }
  // «Предложить другую» — новый отклик по своей цене (сбрасывает контрофер, статус → pending).
  async function doReCounter(price: number) {
    if (!reCounterFor) return;
    try {
      await createBid(reCounterFor.order.id, { price });
      await qc.invalidateQueries({ queryKey: ['my-bids'] });
    } catch (e) {
      // Подписка истекла → на экран пополнения (как в RespondSheet), а не «что-то пошло не так».
      if (apiError(e) === 'subscription_inactive') {
        setReCounterFor(null);
        navigate(routes.spSubscriptionLock);
        return;
      }
      throw e; // прочее (not_verified/сеть) — PriceOfferSheet покажет ошибку
    }
  }

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
                { value: 'all', label: t('specialist.bidsTabAll') },
                { value: 'active', label: t('specialist.bidsTabActive') },
                { value: 'done', label: t('specialist.bidsTabDone') },
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
                const countered = b.status === 'countered' && b.counter_price != null;
                return (
                  <Card key={b.id} pressable={openable} onClick={openable ? () => navigate(routes.chat(b.order.id)) : undefined}>
                    <div className={styles.rowTop}>
                      <BidStatusPill status={b.status as BidStatus} label={t((BID_LABEL[b.status] ?? 'bidStatus.sent') as never)} />
                    </div>
                    <div className={styles.rowTitle}>{b.order.title}</div>
                    <div className={styles.rowBottom} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Price amount={b.price} size="md" />
                      {/* Для countered «Вы получите» считаем от встречной цены — иначе цифра врёт про решение по кнопке «Принять Y». */}
                      <span className={styles.dist}>{t('specialist.youGet')}: {formatTenge(countered ? payout(b.counter_price as number, COMMISSION_PCT) : b.payout)}</span>
                    </div>
                    {countered && (
                      <>
                        <div className={styles.counterNote}>{t('specialist.counterFromClient', { price: formatTenge(b.counter_price as number) })}</div>
                        <div className={styles.bidActions}>
                          <Button variant="secondary" fullWidth disabled={busy === b.id} onClick={() => setReCounterFor(b)}>{t('specialist.reCounter')}</Button>
                          <Button fullWidth loading={busy === b.id} onClick={() => acceptCounter(b)}>{t('specialist.acceptCounter', { price: formatTenge(b.counter_price as number) })}</Button>
                        </div>
                      </>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <PriceOfferSheet
        open={reCounterFor != null}
        onClose={() => setReCounterFor(null)}
        title={t('specialist.reCounterTitle')}
        hint={reCounterFor?.counter_price != null ? t('specialist.reCounterHint', { price: formatTenge(reCounterFor.counter_price) }) : undefined}
        submitLabel={t('specialist.reCounterSubmit')}
        onSubmit={doReCounter}
      />
    </Screen>
  );
}
