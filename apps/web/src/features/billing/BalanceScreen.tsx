import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, EmptyState } from '../../components/ui';
import { fetchBalance, fetchTransactions, type Transaction } from './api';
import { formatTenge } from '../../lib/format';
import { routes } from '../../router/routes';
import styles from './Billing.module.scss';

const TX_LABEL: Record<Transaction['type'], string> = {
  topup: 'Пополнение баланса',
  subscription: 'Списание за подписку',
  commission: 'Комиссия за заказ',
  bonus: 'Бонус',
};

/** S-15 Баланс: градиентная карта (ADR-009), статус подписки, история операций. */
export function BalanceScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: bal } = useQuery({ queryKey: ['balance'], queryFn: fetchBalance, refetchInterval: 10000 });
  const { data: txs = [] } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });

  const nextDate = bal?.next_charge_date ? new Date(bal.next_charge_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : null;

  return (
    <Screen footer={<Button onClick={() => navigate(routes.spTopup)}>{t('specialist.topup')}</Button>}>
      <AppBar showBack largeTitle={t('tabbar.profile') /* Баланс */} />

      <div className={styles.balanceCard}>
        <div className={styles.balLabel}>{t('specialist.currentBalance')}</div>
        <div className={styles.balValue}>{bal ? formatTenge(bal.balance) : '…'}</div>
        <div className={styles.balDivider} />
        <div className={styles.balRow}>
          <span>
            {bal?.subscription_active
              ? `${t('specialist.nextCharge')} ${nextDate ?? ''} · ${bal.subscription_price} ₸/день`
              : t('specialist.subscriptionInactive')}
          </span>
          <span className={[styles.subChip, bal?.subscription_active ? styles.subOn : ''].join(' ')}>
            {bal?.subscription_active ? t('specialist.subscriptionActive') : t('specialist.subscriptionInactive')}
          </span>
        </div>
      </div>

      <div className={styles.histTitle}>{t('specialist.operationsHistory')}</div>
      {txs.length === 0 ? (
        <EmptyState title={t('common.emptyDefault')} />
      ) : (
        <div className={styles.txList}>
          {txs.map((tx) => (
            <div key={tx.id} className={styles.tx}>
              <div>
                <div className={styles.txLabel}>{TX_LABEL[tx.type]}</div>
                <div className={styles.txDate}>{new Date(tx.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className={[styles.txAmount, tx.amount >= 0 ? styles.plus : styles.minus].join(' ')}>
                {tx.amount >= 0 ? '+' : ''}{formatTenge(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
