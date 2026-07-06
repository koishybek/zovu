# Zovu

C2C-маркетплейс бытовых услуг для Казахстана: заказ с ценой и гео → отклики
специалистов рядом (лента / Tinder-колода) → чат → выполнение →
двустороннее подтверждение → взаимные оценки.

Монорепо: `apps/web` (React PWA — ADR-008), `apps/api` (NestJS + Prisma + гео),
`apps/admin` (Vite + React, мини-админка). Документация — [docs/](docs/00-overview.md)
(LLM Wiki, source of truth). Статус — [docs/10-status.md](docs/10-status.md).

## Быстрый старт

```bash
cp .env.example .env                                          # 1
docker compose up -d                                          # 2  postgres+postgis, minio
cd apps/api && npm i && npx prisma migrate dev && npm run seed && npm run start:dev   # 3  API :3000
cd apps/web && npm i && npm run dev                           # 4  PWA :5173
cd apps/admin && npm i && npm run dev                         # 5  админка :5174 (опц.)
```

### Без Docker (Windows dev-машина, ADR-005)

Docker не обязателен. Локальный кластер PostgreSQL 17:

```bash
pg_ctl -D %LOCALAPPDATA%\zovu-pgdata -o "-p 5434" start   # БД на :5434 (cube/earthdistance вместо PostGIS)
cd apps/api && node dist/main.js                          # API (после npm run build)
```

DATABASE_URL уже настроен на `:5434` в `.env`. `STORAGE_PROVIDER=local` — файлы на диске вместо MinIO.

## Демо

```bash
cd apps/api && npm run seed:demo    # 6 специалистов + 4 заказа (Алматы)
```

- **Демо-заказчик:** `+77000000000` · **Демо-специалисты:** `+77010000001…6` · OTP всегда **`1111`**.
- `AUTO_APPROVE_VERIFICATION=true` — верификация специалиста ~5 секунд.
- «Два устройства» из DoD = две вкладки браузера (клиент + специалист).
- **Админка** (`:5174`) — вход по `ADMIN_TOKEN` из `.env` (`dev_admin_token_change_me`).

## Проверка

```bash
cd apps/api && npm test              # 33 jest-теста (бизнес-правила)
cd apps/api && node scripts/e2e.mjs  # e2e happy-path (14 проверок DoD §12, нужен запущенный API)
```

Happy path (e2e): заказ → верификация → блок отклика → пополнение (БП-07) →
лента → отклик (комиссия ADR-001) → принятие + каскад → чат → завершение
(ЗВ-01/02) → взаимные отзывы + пересчёт рейтинга → переключение RU↔KZ.

## Дизайн

Канон стиля — `design/standalone.html` и мокапы `design/mockups/zovu1–4.png`
(iOS-минимализм: белый фон, синий акцент `#4C6FFF`, тонкие бордеры).
`design/_ds/` (Polaris) — только техсправочник, не стиль.
Правила — [docs/06-design-system.md](docs/06-design-system.md). Витрина UI-кита — `/dev/uikit`.
