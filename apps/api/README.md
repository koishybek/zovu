# @zovu/api

NestJS-бэкенд Zovu: REST `/v1`, Socket.IO `/chat`, Prisma + PostgreSQL (+PostGIS),
кроны `@nestjs/schedule`, JWT (access 15 мин / refresh 30 дней).

Полный контур API — [../../docs/04-api.md](../../docs/04-api.md).
Бизнес-правила (обязательны для jest-тестов) — [../../docs/07-business-rules.md](../../docs/07-business-rules.md).

```bash
npm install
npx prisma migrate dev      # схема появится в M2
npm run start:dev           # :3000
npm test                    # jest — бизнес-правила
```

Провайдеры (SMS/платежи/push/storage/модерация) — за интерфейсами, dev-моки по умолчанию.
Ни один прод-ключ для демо не нужен. См. [../../docs/08-integrations.md](../../docs/08-integrations.md).
