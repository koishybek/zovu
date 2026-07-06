import { api } from '../../api/client';

export interface Ticket {
  id: string;
  category: string;
  status: 'new' | 'in_progress' | 'resolved';
  order_id: string | null;
  rating: number | null;
  created_at: string;
  messages: { id: string; sender_type: 'user' | 'agent'; text: string; created_at: string }[];
}

export async function createTicket(payload: { category: string; text: string; orderId?: string }): Promise<Ticket> {
  const { data } = await api.post('/support/tickets', payload);
  return data;
}
export async function fetchTickets(): Promise<Ticket[]> {
  const { data } = await api.get('/support/tickets');
  return data;
}
export async function addTicketMessage(id: string, text: string): Promise<void> {
  await api.post(`/support/tickets/${id}/messages`, { text });
}
export async function rateTicket(id: string, rating: number): Promise<void> {
  await api.post(`/support/tickets/${id}/rate`, { rating });
}
