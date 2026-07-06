import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Демо-сцена Алматы (ZOVU_PROMPT.md §10, M8). Идемпотентно по телефону/title.

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
    create: { phone: clientPhone, name: 'Динара (демо-заказчик)', isClient: true },
    update: { isClient: true },
  });

  // Специалисты
  const codeHash = await argon2.hash('1111');
  void codeHash;
  for (const s of SPECIALISTS) {
    const user = await prisma.user.upsert({
      where: { phone: s.phone },
      create: { phone: s.phone, name: s.name, isSpecialist: true, activeRole: 'specialist' },
      update: { name: s.name, isSpecialist: true },
    });
    const cId = catId(s.cat)!;
    await prisma.specialistProfile.upsert({
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
    const profile = await prisma.specialistProfile.findUnique({ where: { userId: user.id } });
    await prisma.specialistCategory.upsert({
      where: { specialistId_categoryId: { specialistId: profile!.id, categoryId: cId } },
      create: { specialistId: profile!.id, categoryId: cId },
      update: {},
    });
  }

  // Заказы (свежие, чтобы попадали в «Новые»)
  for (const o of ORDERS) {
    const exists = await prisma.order.findFirst({ where: { clientId: client.id, title: o.title } });
    if (exists) continue;
    await prisma.order.create({
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

  console.log(`Demo seeded: ${SPECIALISTS.length} specialists, ${ORDERS.length} orders (Almaty). Demo phones use OTP 1111.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
