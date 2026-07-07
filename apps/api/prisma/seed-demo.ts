import { PrismaClient, type Order } from '@prisma/client';
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

// --- Мини-генератор PNG для демо-фото заказов (без внешних зависимостей) ---
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function solidPng(w: number, h: number, rgb: [number, number, number]): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) {
    // лёгкий вертикальный оттенок делает блок менее «плоским»
    row[1 + x * 3] = rgb[0];
    row[2 + x * 3] = rgb[1];
    row[3 + x * 3] = rgb[2];
  }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0))]);
}
// resolve() совпадает с логикой LocalStorageProvider (важно при абсолютном LOCAL_STORAGE_DIR).
const STORAGE_PUBLIC = resolve(process.env.LOCAL_STORAGE_DIR ?? '.storage', 'public');
function writeDemoPhoto(rgb: [number, number, number]): string {
  mkdirSync(STORAGE_PUBLIC, { recursive: true }); // папка может не существовать до старта API
  const name = `${randomBytes(12).toString('hex')}.png`;
  writeFileSync(join(STORAGE_PUBLIC, name), solidPng(400, 300, rgb));
  return `public/${name}`;
}
const DEMO_PHOTOS: Record<string, [number, number, number][]> = {
  'Установить розетку': [[206, 212, 224], [96, 122, 186]],
  'Заменить люстру': [[232, 224, 208], [196, 170, 116]],
  'Починить выключатель': [[222, 216, 210], [150, 130, 120]],
  'Подключить варочную панель': [[214, 220, 214], [120, 150, 130]],
};

// Демо-сцена Алматы (ZOVU_PROMPT.md §10, M8). Идемпотентно по телефону/title.
// Наполняет ОБЕ стороны: у заказчика — заказы + отклики + активная сделка + чат;
// у специалиста (Асхат) — принятый отклик, активный заказ и чат. OTP всегда 1111.

const COMMISSION_PCT = 5; // ADR-001

const SPECIALISTS = [
  { phone: '+77010000001', name: 'Асхат Нурланов', cat: 'Электрика', rating: 4.9, orders: 63, diploma: true, balance: 3200 },
  { phone: '+77010000002', name: 'Ержан Тлеубеков', cat: 'Электрика', rating: 4.7, orders: 41, diploma: true, balance: 1800 },
  { phone: '+77010000003', name: 'Данияр Сапаров', cat: 'Сантехника', rating: 4.8, orders: 55, diploma: false, balance: 950 },
  { phone: '+77010000004', name: 'Марат Абдиев', cat: 'Электрика', rating: 4.5, orders: 22, diploma: false, balance: 400 },
  { phone: '+77010000005', name: 'Тимур Касымов', cat: 'Бытовая техника', rating: 5.0, orders: 88, diploma: true, balance: 5400 },
  { phone: '+77010000006', name: 'Айбек Жумабаев', cat: 'Электрика', rating: 4.6, orders: 30, diploma: false, balance: 1200 },
];

const ORDERS = [
  { title: 'Установить розетку', description: 'Двойная розетка в гостиной, стена бетон.', cat: 'Электрика', budget: 5000, address: 'ул. Абая, 150', lat: 43.2405, lng: 76.9150 },
  { title: 'Заменить люстру', description: 'Снять старую, повесить новую 5-рожковую.', cat: 'Электрика', budget: 7000, address: 'пр. Достык, 85', lat: 43.2350, lng: 76.9560 },
  { title: 'Починить выключатель', description: 'Не работает выключатель в коридоре.', cat: 'Электрика', budget: 3000, address: 'ул. Тимирязева, 42', lat: 43.2230, lng: 76.9060 },
  { title: 'Подключить варочную панель', description: 'Индукционная панель, нужен отдельный автомат.', cat: 'Бытовая техника', budget: 8500, address: 'ул. Розыбакиева, 320', lat: 43.2280, lng: 76.8810 },
];

async function main(): Promise<void> {
  const cats = await prisma.category.findMany({ where: { status: 'approved' } });
  const catId = (name: string) => cats.find((c) => c.name === name)?.id;

  // Демо-заказчик
  const clientPhone = '+77000000000';
  const client = await prisma.user.upsert({
    where: { phone: clientPhone },
    create: { phone: clientPhone, name: 'Динара Сатпаева', isClient: true },
    update: { isClient: true, name: 'Динара Сатпаева' },
  });

  // Специалисты (+ карта телефон → profileId для откликов)
  const profileByPhone = new Map<string, string>();
  for (const s of SPECIALISTS) {
    const user = await prisma.user.upsert({
      where: { phone: s.phone },
      create: { phone: s.phone, name: s.name, isSpecialist: true, activeRole: 'specialist' },
      update: { name: s.name, isSpecialist: true },
    });
    const cId = catId(s.cat)!;
    const profile = await prisma.specialistProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        mainCategoryId: cId,
        rating: s.rating,
        completedOrdersCount: s.orders,
        verificationStatus: 'approved',
        diplomaStatus: s.diploma ? 'approved' : 'none',
        balance: s.balance,
        subscriptionActive: true,
        about: `Мастер по направлению «${s.cat}». Работаю по Алматы.`,
      },
      update: { rating: s.rating, completedOrdersCount: s.orders, balance: s.balance, subscriptionActive: true },
    });
    await prisma.specialistCategory.upsert({
      where: { specialistId_categoryId: { specialistId: profile.id, categoryId: cId } },
      create: { specialistId: profile.id, categoryId: cId },
      update: {},
    });
    profileByPhone.set(s.phone, profile.id);
  }

  // Заказы (свежие, чтобы попадали в «Новые»)
  const orderRecords: Order[] = [];
  for (const o of ORDERS) {
    let order = await prisma.order.findFirst({ where: { clientId: client.id, title: o.title } });
    if (!order) {
      order = await prisma.order.create({
        data: {
          clientId: client.id,
          categoryId: catId(o.cat)!,
          title: o.title,
          description: o.description,
          budget: o.budget,
          address: o.address,
          lat: o.lat,
          lng: o.lng,
          status: 'active',
        },
      });
    }
    orderRecords.push(order);
  }

  // Сброс скрытых заказов демо-специалистов (за время демо-тестов колода могла опустеть
  // от свайпов влево). Демо всегда должно показывать заказы в ленте.
  await prisma.hiddenOrder.deleteMany({ where: { specialistId: { in: [...profileByPhone.values()] } } });

  // Демо-фото заказов (идемпотентно: только если фото ещё нет).
  for (const o of orderRecords) {
    if (o.photos.length === 0 && DEMO_PHOTOS[o.title]) {
      const keys = DEMO_PHOTOS[o.title].map(writeDemoPhoto);
      await prisma.order.update({ where: { id: o.id }, data: { photos: keys } });
      o.photos = keys;
    }
  }

  // Отклики на первый заказ («Установить розетку») от трёх электриков.
  const firstOrder = orderRecords[0];
  const BIDDERS = [
    { phone: '+77010000001', price: 5000, accept: true, availability: 'today', hasMaterials: true, comment: 'Готов подъехать сегодня, розетки и подрозетник свои.' }, // Асхат
    { phone: '+77010000002', price: 5500, accept: false, availability: 'tomorrow', hasMaterials: false, comment: 'Сделаю аккуратно, материалы за ваш счёт.' }, // Ержан
    { phone: '+77010000004', price: 4800, accept: false, availability: 'this_week', hasMaterials: true, comment: null as string | null }, // Марат
  ];
  for (const b of BIDDERS) {
    const specialistId = profileByPhone.get(b.phone)!;
    await prisma.bid.upsert({
      where: { orderId_specialistId: { orderId: firstOrder.id, specialistId } },
      create: {
        orderId: firstOrder.id,
        specialistId,
        price: b.price,
        commission: Math.round((b.price * COMMISSION_PCT) / 100),
        availability: b.availability,
        hasMaterials: b.hasMaterials,
        comment: b.comment,
      },
      update: {
        availability: b.availability,
        hasMaterials: b.hasMaterials,
        comment: b.comment,
      },
    });
  }

  // Живые pending-отклики на второй заказ («Заменить люстру») — чтобы S-23 показывал
  // выбор из нескольких «богатых» карточек (структурированный отклик, №8).
  const secondOrder = orderRecords[1];
  const PENDING = [
    { phone: '+77010000002', price: 7000, availability: 'today', hasMaterials: true, comment: 'Повешу сегодня вечером, крепёж свой.' }, // Ержан
    { phone: '+77010000006', price: 6500, availability: 'tomorrow', hasMaterials: false, comment: 'Опыт с люстрами большой, сделаю завтра утром.' }, // Айбек
    { phone: '+77010000004', price: 8000, availability: 'this_week', hasMaterials: true, comment: null as string | null }, // Марат
  ];
  for (const b of PENDING) {
    const specialistId = profileByPhone.get(b.phone)!;
    await prisma.bid.upsert({
      where: { orderId_specialistId: { orderId: secondOrder.id, specialistId } },
      create: {
        orderId: secondOrder.id,
        specialistId,
        price: b.price,
        commission: Math.round((b.price * COMMISSION_PCT) / 100),
        availability: b.availability,
        hasMaterials: b.hasMaterials,
        comment: b.comment,
      },
      update: { availability: b.availability, hasMaterials: b.hasMaterials, comment: b.comment },
    });
  }

  // Принятие отклика Асхата → активный заказ + каскад + чат + сообщения (идемпотентно).
  if (firstOrder.status === 'active') {
    const acceptedSpecId = profileByPhone.get('+77010000001')!;
    const acceptedBid = await prisma.bid.findUnique({
      where: { orderId_specialistId: { orderId: firstOrder.id, specialistId: acceptedSpecId } },
    });
    if (acceptedBid) {
      await prisma.bid.update({ where: { id: acceptedBid.id }, data: { status: 'accepted' } });
      await prisma.bid.updateMany({
        where: { orderId: firstOrder.id, id: { not: acceptedBid.id } },
        data: { status: 'not_selected' },
      });
      await prisma.order.update({
        where: { id: firstOrder.id },
        data: { status: 'in_progress', acceptedBidId: acceptedBid.id },
      });
      // Списание комиссии с баланса Асхата (ADR-001).
      const acceptedProfile = await prisma.specialistProfile.findUnique({ where: { id: acceptedSpecId } });
      if (acceptedProfile) {
        const newBalance = acceptedProfile.balance - acceptedBid.commission;
        await prisma.specialistProfile.update({ where: { id: acceptedSpecId }, data: { balance: newBalance } });
        await prisma.transaction.create({
          data: {
            userId: acceptedProfile.userId,
            type: 'commission',
            amount: -acceptedBid.commission,
            balanceAfter: newBalance,
            meta: { orderId: firstOrder.id },
          },
        });
      }
      // Чат по заказу + пара сообщений.
      const chat = await prisma.chat.upsert({
        where: { orderId: firstOrder.id },
        create: { orderId: firstOrder.id },
        update: {},
      });
      const msgCount = await prisma.message.count({ where: { chatId: chat.id } });
      if (msgCount === 0) {
        const acceptedUser = await prisma.user.findFirst({ where: { phone: '+77010000001' } });
        await prisma.message.create({
          data: { chatId: chat.id, senderId: acceptedUser!.id, text: 'Здравствуйте! Готов подъехать сегодня после 17:00.' },
        });
        await prisma.message.create({
          data: { chatId: chat.id, senderId: client.id, text: 'Отлично, буду дома. Адрес — Абая 150.' },
        });
      }
    }
  }

  console.log(
    `Demo seeded: ${SPECIALISTS.length} specialists, ${ORDERS.length} orders, bids on «${firstOrder.title}» (1 accepted → chat). OTP 1111.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
