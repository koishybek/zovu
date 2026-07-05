import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed-справочник 12 категорий (К-01, docs/07-business-rules.md §5). name — RU-канон, nameKk — черновик.
const CATEGORIES: { name: string; nameKk: string }[] = [
  { name: 'Электрика', nameKk: 'Электрика' },
  { name: 'Сантехника', nameKk: 'Сантехника' },
  { name: 'Уборка', nameKk: 'Тазалау' },
  { name: 'Ремонт', nameKk: 'Жөндеу' },
  { name: 'Сборка мебели', nameKk: 'Жиһаз құрастыру' },
  { name: 'Бытовая техника', nameKk: 'Тұрмыстық техника' },
  { name: 'Отделка', nameKk: 'Әрлеу' },
  { name: 'Грузоперевозки', nameKk: 'Жүк тасымалдау' },
  { name: 'Клининг после ремонта', nameKk: 'Жөндеуден кейінгі тазалау' },
  { name: 'Компьютерная помощь', nameKk: 'Компьютерлік көмек' },
  { name: 'Красота', nameKk: 'Сұлулық' },
  { name: 'Репетиторство', nameKk: 'Репетиторлық' },
];

async function main(): Promise<void> {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: c.name },
      create: { name: c.name, nameKk: c.nameKk, status: 'approved' },
      update: { nameKk: c.nameKk, status: 'approved' },
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
