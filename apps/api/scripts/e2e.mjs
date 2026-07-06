// Zovu e2e happy-path (Definition of Done §12). Запуск: node scripts/e2e.mjs
// Требует поднятый API на :3000 и засеянные категории. Node 22+ (global fetch/FormData/Blob).

const BASE = process.env.E2E_BASE ?? 'http://localhost:3000/v1';
let passed = 0;
function ok(cond, msg) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  passed++;
  console.log(`  ✓ ${msg}`);
}
async function api(path, { method = 'GET', token, body, admin } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (admin) headers['X-Admin-Token'] = admin;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}
async function auth(phone) {
  await api('/auth/otp/request', { method: 'POST', body: { phone } });
  const v = await api('/auth/otp/verify', { method: 'POST', body: { phone, code: '1111' } });
  return { token: v.access_token, user: v.user, isNew: v.is_new_user };
}
const rnd = () => Math.floor(1000000 + Math.random() * 8999999);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('Zovu e2e happy-path\n');

  // 1. Заказчик создаёт заказ
  console.log('1. Заказчик');
  const client = await auth('+7700' + rnd());
  await api('/me', { method: 'PATCH', token: client.token, body: { name: 'E2E Клиент' } });
  const cats = await api('/categories');
  const order = await api('/orders', { method: 'POST', token: client.token, body: { categoryId: cats[0].id, title: 'Установить розетку', description: 'Двойная розетка', budget: 5000, address: 'ул. Абая, 150', lat: 43.2405, lng: 76.915 } });
  ok(order.status === 'active', 'заказ создан (active)');

  // 2. Специалист: онбординг + верификация
  console.log('2. Специалист');
  const sp = await auth('+7701' + rnd());
  await api('/specialist/profile', { method: 'POST', token: sp.token, body: { name: 'E2E Мастер', dob: '1990-01-01', mainCategoryId: cats[0].id } });
  const fd = new FormData();
  fd.append('selfie', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 's.png');
  fd.append('selfieWithDoc', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 'd.png');
  await fetch(`${BASE}/specialist/verification`, { method: 'POST', headers: { Authorization: `Bearer ${sp.token}` }, body: fd });
  await sleep(6000);
  const me1 = await api('/me', { token: sp.token });
  ok(me1.specialist_profile.verificationStatus === 'approved', 'верификация одобрена (AUTO_APPROVE)');

  // 3. Денежный цикл: отклик заблокирован → пополнение → активация
  console.log('3. Деньги');
  const bal0 = await api('/balance', { token: sp.token });
  ok(bal0.can_bid === false, 'отклик заблокирован (Б-01, подписка неактивна)');
  let blocked = false;
  try { await api(`/orders/${order.id}/bids`, { method: 'POST', token: sp.token, body: { price: 5000 } }); } catch { blocked = true; }
  ok(blocked, 'попытка отклика → 403 (БП-02)');
  const bal1 = await api('/topup', { method: 'POST', token: sp.token, body: { amount: 2000, method: 'kaspi' } });
  ok(bal1.subscription_active === true && bal1.balance === 1900, 'пополнение → активация БП-07 (2000−100=1900)');

  // 4. Отклик + лента
  console.log('4. Отклик');
  const feed = await api('/orders/feed?lat=43.24&lng=76.89', { token: sp.token });
  ok(feed.some((o) => o.id === order.id && o.is_new), 'заказ в ленте, is_new=true (С-03)');
  const bid = await api(`/orders/${order.id}/bids`, { method: 'POST', token: sp.token, body: { price: 5000 } });
  ok(bid.commission === 250 && bid.payout === 4750, 'комиссия 250, «Вы получите» 4750 (ADR-001)');

  // 5. Принятие + каскад + чат
  console.log('5. Принятие');
  const sp2 = await auth('+7702' + rnd()); // второй специалист для каскада
  await api('/specialist/profile', { method: 'POST', token: sp2.token, body: { name: 'E2E Мастер 2', dob: '1990-01-01', mainCategoryId: cats[0].id } });
  const fd2 = new FormData();
  fd2.append('selfie', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 's.png');
  fd2.append('selfieWithDoc', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 'd.png');
  await fetch(`${BASE}/specialist/verification`, { method: 'POST', headers: { Authorization: `Bearer ${sp2.token}` }, body: fd2 });
  await sleep(6000);
  await api('/topup', { method: 'POST', token: sp2.token, body: { amount: 2000, method: 'kaspi' } });
  const bid2 = await api(`/orders/${order.id}/bids`, { method: 'POST', token: sp2.token, body: { price: 4800 } });
  const acc = await api(`/bids/${bid.id}/accept`, { method: 'POST', token: client.token });
  ok(acc.cascaded === 1, 'принятие → каскад 1 отклика');
  const myBid2 = await api('/bids/my', { token: sp2.token });
  ok(myBid2.find((b) => b.id === bid2.id).status === 'not_selected', 'второй отклик → «Не выбран» (каскад)');
  const chats = await api('/chats', { token: client.token });
  ok(chats.length === 1, 'чат создан автоматически (Ч-01)');

  // 6. Завершение
  console.log('6. Завершение');
  const c = await api(`/orders/${order.id}/complete`, { method: 'POST', token: client.token });
  ok(c.status === 'awaiting_confirmation', 'заказчик «Завершить» → ожидает подтверждения (ЗВ-01)');
  const cf = await api(`/orders/${order.id}/confirm`, { method: 'POST', token: sp.token });
  ok(cf.status === 'completed', 'специалист «Подтвердить» → выполнен (ЗВ-02)');

  // 7. Взаимные отзывы + рейтинг
  console.log('7. Отзывы');
  await api(`/orders/${order.id}/reviews`, { method: 'POST', token: client.token, body: { stars: 5, text: 'Отлично!' } });
  await api(`/orders/${order.id}/reviews`, { method: 'POST', token: sp.token, body: { stars: 5, text: 'Спасибо!' } });
  const meSp = await api('/me', { token: sp.token });
  ok(meSp.specialist_profile.rating === 5 && meSp.specialist_profile.completedOrdersCount >= 1, 'рейтинг специалиста обновлён (5★), заказ засчитан');

  // 8. RU ↔ KZ
  console.log('8. Локализация');
  const kk = await api('/me', { method: 'PATCH', token: client.token, body: { lang: 'kk' } });
  ok(kk.lang === 'kk', 'язык переключается RU→KZ (НФ-02)');

  console.log(`\n✅ HAPPY PATH PASSED — ${passed} assertions`);
}

main().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
