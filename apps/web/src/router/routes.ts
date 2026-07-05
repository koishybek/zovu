// Карта роутов S-01…S-35 (docs/05-screens.md). Пути — канон навигации и диплинков.
// Функции-билдеры для параметризованных путей.

export const routes = {
  // Онбординг и auth (S-01…S-08)
  welcome: '/auth/welcome', // S-01
  phone: '/auth/phone', // S-02
  otp: '/auth/otp', // S-03
  role: '/onboarding/role', // S-04
  spProfileForm: '/onboarding/specialist/profile', // S-05
  spVerification: '/onboarding/specialist/verification', // S-06
  spPending: '/onboarding/specialist/pending', // S-07
  spSuccess: '/onboarding/specialist/success', // S-08
  clientName: '/onboarding/client/name', // ФИО заказчика

  // Специалист (shell /sp, S-10…S-18)
  spMap: '/sp/map', // S-10
  spOrders: '/sp/orders', // S-11 (Колода/Список/Карта)
  spOrder: (id: string | number = ':id') => `/sp/orders/${id}`, // S-12
  spRespond: (id: string | number = ':id') => `/sp/orders/${id}/respond`, // S-13
  spBids: '/sp/bids', // S-14
  spBalance: '/sp/balance', // S-15
  spTopup: '/sp/topup', // S-16
  spSubscriptionLock: '/sp/subscription-lock', // S-17
  spProfile: '/sp/profile', // S-18

  // Заказчик (shell /client, S-20…S-27)
  clientOrderNew: '/client/orders/new', // S-20
  clientOrderNewFilters: '/client/orders/new/filters', // S-21 (шит)
  clientOrderFilters: (id: string | number = ':id') => `/client/orders/${id}/filters`,
  clientMap: '/client/map', // S-22
  clientOrders: '/client/orders', // список «Мои заказы»
  clientOrder: (id: string | number = ':id') => `/client/orders/${id}`, // S-25/S-26
  clientOrderBids: (id: string | number = ':id') => `/client/orders/${id}/bids`, // S-23
  clientBid: (id: string | number = ':id', bidId: string | number = ':bidId') =>
    `/client/orders/${id}/bids/${bidId}`, // S-24
  clientOrderReview: (id: string | number = ':id') => `/client/orders/${id}/review`, // S-27
  clientBids: '/client/bids', // таб «Отклики»
  clientChats: '/client/chats', // таб «Чаты»

  // Общие (S-30…S-35)
  chat: (id: string | number = ':id') => `/chat/${id}`, // S-30
  support: '/support', // S-31 список
  supportNew: '/support/new',
  supportTicket: (id: string | number = ':id') => `/support/${id}`,
  notifications: '/notifications', // S-32
  reviews: (userId: string | number = ':userId') => `/reviews/${userId}`, // S-33
  roleSwitch: '/role', // S-34
  settings: '/settings', // S-35

  // Dev
  uikit: '/dev/uikit',
} as const;

/** Роли и их таббары (docs/05-screens.md). */
export const SPECIALIST_TABS = [
  { key: 'map', path: routes.spMap, icon: 'map' },
  { key: 'orders', path: routes.spOrders, icon: 'orders' },
  { key: 'bids', path: routes.spBids, icon: 'bids' },
  { key: 'profile', path: routes.spProfile, icon: 'profile' },
] as const;

export const CLIENT_TABS = [
  { key: 'myOrders', path: routes.clientOrders, icon: 'orders' },
  { key: 'myBids', path: routes.clientBids, icon: 'bids' },
  { key: 'chats', path: routes.clientChats, icon: 'chat' },
  { key: 'profile', path: routes.spProfile, icon: 'profile' },
] as const;
