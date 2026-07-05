# Zovu

C2C-маркетплейс бытовых услуг для Казахстана: заказ с ценой и гео → отклики
специалистов рядом (лента / карта / Tinder-колода) → чат → выполнение →
двустороннее подтверждение → взаимные оценки.

Монорепо: `apps/web` (React PWA — ADR-008), `apps/api` (NestJS + Prisma + PostGIS),
`apps/admin` (Vite + React). Документация — [docs/](docs/00-overview.md)
(LLM Wiki, source of truth). Статус — [docs/10-status.md](docs/10-status.md).

## Быстрый старт (≤ 5 команд)

```bash
cp .env.example .env
docker compose up -d                                  # postgres+postgis, minio
cd apps/api && npm i && npx prisma migrate dev && npm run start:dev
cd apps/web && npm i && npm run dev                   # PWA на :5173
cd apps/admin && npm i && npm run dev                 # опционально: админка
```

Без Docker (Windows dev-машина): см. ADR-005 в
[docs/09-decisions.md](docs/09-decisions.md) — локальный PostgreSQL и
`STORAGE_PROVIDER=local`.

## Демо

- OTP в dev всегда `1111` (печатается в лог API).
- `AUTO_APPROVE_VERIFICATION=true` — верификация специалиста ~5 секунд.
- «Два устройства» из Definition of Done = две вкладки браузера (клиент + специалист).
- Сид-данные: Алматы, заказы по электрике + 5–6 специалистов (появятся в M8).

## Дизайн

Канон стиля — `design/standalone.html` и мокапы `design/mockups/zovu1–4.png`
(iOS-минимализм: белый фон, синий акцент `#4C6FFF`, тонкие бордеры).
`design/_ds/` (Polaris) — только техсправочник, не стиль.
Правила — [docs/06-design-system.md](docs/06-design-system.md).
