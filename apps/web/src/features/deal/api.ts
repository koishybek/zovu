import { api } from '../../api/client';

export async function completeOrder(orderId: string): Promise<{ status: string }> {
  const { data } = await api.post(`/orders/${orderId}/complete`);
  return data;
}
export async function confirmOrder(orderId: string): Promise<{ status: string }> {
  const { data } = await api.post(`/orders/${orderId}/confirm`);
  return data;
}
export async function specialistDone(orderId: string): Promise<{ ok: boolean }> {
  const { data } = await api.post(`/orders/${orderId}/specialist-done`);
  return data;
}

export async function createReview(orderId: string, stars: number, text?: string): Promise<{ id: string }> {
  const { data } = await api.post(`/orders/${orderId}/reviews`, { stars, text });
  return data;
}

export interface UserReview {
  id: string;
  stars: number;
  text: string | null;
  author_name: string | null;
  created_at: string;
}
export async function fetchUserReviews(userId: string): Promise<UserReview[]> {
  const { data } = await api.get(`/users/${userId}/reviews`);
  return data;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
}
export interface ChatSummary {
  id: string;
  order: { id: string; title: string; clientId: string; status: string };
  closed: boolean;
  last_message: string | null;
  unread: number;
}
export async function fetchChats(): Promise<ChatSummary[]> {
  const { data } = await api.get('/chats');
  return data;
}
export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const { data } = await api.get(`/chats/${chatId}/messages`);
  return data;
}

export interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: { route?: string };
  read: boolean;
  created_at: string;
}
export async function fetchNotifications(): Promise<Notif[]> {
  const { data } = await api.get('/notifications');
  return data;
}
export async function markNotificationsRead(): Promise<void> {
  await api.post('/notifications/read');
}
