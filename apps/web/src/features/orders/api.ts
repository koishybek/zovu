import { api } from '../../api/client';
import { compressImage } from '../../lib/image';

/** Сжать и загрузить фото → вернуть публичный ключ хранилища. */
export async function uploadOrderPhoto(file: File): Promise<string> {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append('file', blob, 'photo.jpg');
  const { data } = await api.post('/uploads/image', form);
  return data.key as string;
}

export interface OrderFilters {
  certifiedOnly?: boolean;
  minRating?: number;
  minOrders?: number;
  maxDistanceKm?: number;
}

export interface Order {
  id: string;
  client_id: string;
  category_id: string;
  category_name: string | null;
  title: string;
  description: string;
  photos: string[];
  budget: number;
  address: string;
  lat: number | null;
  lng: number | null;
  status: string;
  filters: OrderFilters;
  accepted_bid_id: string | null;
  created_at: string;
}

export interface FeedOrder extends Order {
  distance_m: number | null;
  is_new: boolean;
}

export type BidAvailability = 'today' | 'tomorrow' | 'this_week';

export interface OrderBid {
  id: string;
  price: number;
  status: string;
  availability: BidAvailability | null;
  has_materials: boolean | null;
  comment: string | null;
  specialist: {
    id: string;
    name: string | null;
    rating: number;
    completed_orders: number;
    diploma: boolean;
    about: string | null;
  };
}

export interface BidInput {
  price: number;
  availability?: BidAvailability;
  hasMaterials?: boolean;
  comment?: string;
}

export interface MyBid {
  id: string;
  order_id: string;
  price: number;
  commission: number;
  payout: number;
  status: string;
  order: { id: string; title: string; budget: number; status: string };
}

export async function createOrder(payload: {
  categoryId: string;
  title: string;
  description: string;
  photos?: string[];
  budget: number;
  address: string;
  lat?: number;
  lng?: number;
  filters?: OrderFilters;
}): Promise<Order> {
  const { data } = await api.post('/orders', payload);
  return data;
}

export async function fetchFeed(lat?: number, lng?: number): Promise<FeedOrder[]> {
  const { data } = await api.get('/orders/feed', { params: { lat, lng } });
  return data;
}

export async function fetchMyOrders(): Promise<(Order & { bids_count: number })[]> {
  const { data } = await api.get('/orders/my');
  return data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function hideOrder(id: string): Promise<void> {
  await api.post(`/orders/${id}/hide`);
}

export async function createBid(orderId: string, input: BidInput): Promise<MyBid> {
  const { data } = await api.post(`/orders/${orderId}/bids`, {
    price: input.price,
    availability: input.availability,
    hasMaterials: input.hasMaterials,
    comment: input.comment,
  });
  return data;
}

export async function fetchOrderBids(orderId: string): Promise<OrderBid[]> {
  const { data } = await api.get(`/orders/${orderId}/bids`);
  return data;
}

export async function fetchMyBids(): Promise<MyBid[]> {
  const { data } = await api.get('/bids/my');
  return data;
}

export async function acceptBid(bidId: string): Promise<{ ok: boolean; cascaded: number }> {
  const { data } = await api.post(`/bids/${bidId}/accept`);
  return data;
}

export async function declineBid(bidId: string): Promise<void> {
  await api.post(`/bids/${bidId}/decline`);
}
