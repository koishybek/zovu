import { api } from '../../api/client';

export interface Balance {
  balance: number;
  subscription_active: boolean;
  subscription_free_until: string | null;
  subscription_price: number;
  next_charge_date: string | null;
  can_bid: boolean;
}

export interface Transaction {
  id: string;
  type: 'topup' | 'subscription' | 'commission' | 'bonus';
  amount: number;
  balance_after: number;
  created_at: string;
}

export async function fetchBalance(): Promise<Balance> {
  const { data } = await api.get('/balance');
  return data;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await api.get('/transactions');
  return data;
}

export async function topup(amount: number, method: 'kaspi' | 'card'): Promise<Balance> {
  const { data } = await api.post('/topup', { amount, method });
  return data;
}
