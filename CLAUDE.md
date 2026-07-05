# Zovu — вход для LLM

C2C-маркетплейс услуг (Казахстан): заказчик публикует заказ с ценой и гео,
специалисты рядом откликаются. Две роли на одном аккаунте. B2B НЕ СУЩЕСТВУЕТ.

## Сначала читай docs/ (LLM Wiki — source of truth)

Порядок: `docs/10-status.md` (где мы) → `docs/00-overview.md` (карта вики) →
страницы по теме задачи. Расхождение кода и вики — баг. Любое отступление от
`ZOVU_PROMPT.md` — ADR в `docs/09-decisions.md`, без вопросов пользователю.
После каждого майлстоуна обновляй `docs/10-status.md` и затронутые страницы.

## Стек

- `apps/web` — **React PWA** (ADR-008, заменил Flutter): Vite + React 19 + TS,
  React Router, TanStack Query (server-state), Zustand (UI-state), i18next (ru+kk),
  socket.io-client, axios, zod, vite-plugin-pwa. Токены — `src/theme/tokens.ts`.
- `apps/api` — NestJS 10 + Prisma + PostgreSQL (+PostGIS), Socket.IO, @nestjs/schedule, JWT.
- `apps/admin` — Vite + React + TS, статический токен из `.env`.
- Стиль UI — из `design/standalone.html` (канон!), НЕ из Polaris (`design/_ds/`).
  Токены: `docs/06-design-system.md`. Мокапы: `design/mockups/zovu1–4.png`.

## Команды

```bash
docker compose up -d                 # postgres+postgis :5434, minio :9000
cd apps/api && npx prisma migrate dev && npm run start:dev   # API :3000
cd apps/api && npm test              # jest — бизнес-правила
cd apps/web && npm run dev           # PWA :5173 (proxy /v1 и /chat → :3000)
cd apps/web && npm run build         # tsc --noEmit + vite build (0 ошибок перед коммитом)
cd apps/admin && npm run dev         # админка
```

Dev-машина без Docker: локальный PG17 + `STORAGE_PROVIDER=local` — см. ADR-005
в `docs/09-decisions.md`. Демо «на двух устройствах» = две вкладки браузера.
OTP в dev всегда `1111`. `AUTO_APPROVE_VERIFICATION=true` — верификация ~5 сек.

## Конвенции

- Коммиты: conventional, один на майлстоун — `feat(m4): orders, deck & bids`.
- UI-строки только через i18next-ресурсы: ru — канон (Приложение A промпта),
  kk — черновик с `// TODO native review`. Никаких хардкод-строк в компонентах.
- JSON API — snake_case; роуты REST `/v1`; фронт feature-first: `src/features/<f>/`.
- Секреты только в `.env` (`.env.example` — полный список).
- Обязательные jest-тесты бизнес-правил — список в `docs/07-business-rules.md`.
- Запрещено: градиенты, тяжёлые тени, >1 primary-CTA на экран, кастомные
  шрифты вне SF Pro/Inter, слова «компания/менеджер/сотрудник» в коде и UI.
