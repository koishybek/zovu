# 02 — Архитектура

> Страница описывает монорепо, стек каждой части, схему взаимодействий, env-переменные и особенности dev-машины. Продукт и скоуп — [00-overview.md](00-overview.md) и [01-scope.md](01-scope.md); модель данных — [03-data-model.md](03-data-model.md); API — [04-api.md](04-api.md); бизнес-правила — [07-business-rules.md](07-business-rules.md).

## 1. Принципы

1. **Монорепо, три приложения**: клиент — React PWA (`apps/web`, устанавливаемое web-приложение для заказчиков и специалистов; стек фронта — ADR-008, [09-decisions.md](09-decisions.md)), NestJS-API, web-админка (см. [01-scope.md](01-scope.md)).
2. **Все внешние интеграции — за интерфейсами** (`SmsProvider`, `PaymentProvider`, `PushProvider`, `Storage`, `Moderator`, `MapTilesConfig`); по умолчанию работают dev-моки, прод-адаптеры — заглушки с TODO. Выбор реализации — через env (`SMS_PROVIDER=dev` и т.д.). Ни один прод-ключ не нужен для запуска демо. Детали — [08-integrations.md](08-integrations.md).
3. **Вики = source of truth.** Расхождение кода и вики — баг. Отступления фиксируются как ADR в [09-decisions.md](09-decisions.md).
4. **B2B не существует** — в архитектуре нет сущностей и панелей раздела 12 ТЗ (полный список исключений — [01-scope.md](01-scope.md)).

## 2. Структура монорепо (ZOVU_PROMPT.md §2)

```
zovu/
├── CLAUDE.md               # краткий вход для LLM (≤ 60 строк)
├── ZOVU_PROMPT.md          # мастер-промпт (продукт, скоуп, правила)
├── ZOVU_DESIGN_HANDOFF.md  # как обращаться с design/ (канон стиля — standalone.html)
├── docs/                   # LLM Wiki — source of truth (эта вики)
│   └── api/openapi.json    # экспорт Swagger (см. 04-api.md)
├── design/                 # экспорт дизайна: standalone.html (канон), canvases/, mockups/, _ds/
├── docker-compose.yml      # postgres(+postgis) :5434, minio :9000/:9001, api (профиль `full`)
├── .env.example            # полный список env (см. §6 ниже)
└── apps/
    ├── web/                # Vite 7 + React 19 + TS — клиентская PWA (ADR-008)
    ├── api/                # NestJS 10 + Prisma + PostgreSQL 15 + PostGIS
    └── admin/              # Vite + React + TS (минимальный, без дизайн-требований)
```

## 3. Схема взаимодействий

```mermaid
flowchart LR
    subgraph clients["Клиенты"]
        web["apps/web<br/>web PWA (React)"]
        admin["apps/admin<br/>Vite + React + TS"]
    end

    subgraph api["apps/api — NestJS 10 (порт 3000)"]
        rest["REST /v1<br/>class-validator, Swagger"]
        ws["Socket.IO gateway<br/>namespace /chat"]
        cron["Кроны @nestjs/schedule<br/>00:00 Almaty — подписки Б-03…Б-05, ADR-002<br/>каждые 10 мин — автозакрытия ЗВ-03/ЗВ-04 + пуш Ф-08<br/>каждую минуту — протухшие OTP"]
        uploads["UploadsModule<br/>POST /v1/uploads/image — JWT, multipart<br/>GET /v1/files/public/:name — БЕЗ auth"]
        prov["Провайдеры за интерфейсами<br/>Sms / Payment / Push / Storage / Moderator"]
    end

    pg[("PostgreSQL 15 + PostGIS<br/>через Prisma")]
    minio[("MinIO S3<br/>бакеты public / private НФ-09")]

    web -->|"REST /v1 — axios, Bearer JWT"| rest
    web <-->|"WS /chat — socket.io-client"| ws
    web -->|"фото заказа: upload JWT / раздача public"| uploads
    admin -->|"REST admin/* — статический ADMIN_TOKEN"| rest
    rest --> pg
    ws --> pg
    cron --> pg
    uploads --> minio
    prov --> minio
```

- **web ↔ api**: REST `/v1` (JSON snake_case, Bearer JWT) + WebSocket namespace `/chat` (события `message:new`, `message:read`, `chat:closed` — см. [04-api.md](04-api.md)).
- **api ↔ PostgreSQL**: Prisma; гео-запросы PostGIS `ST_DWithin` / `ST_Distance`, точка заказа — PostGIS point + GiST-индекс ([03-data-model.md](03-data-model.md)).
- **api ↔ MinIO**: фото заказов — публичный бакет; селфи-верификация и дипломы — приватный бакет, доступ только админ-эндпоинтам (НФ-09, ДС-*).
- **Загрузка/раздача фото заказа — `UploadsModule`** (`apps/api/src/uploads/`, зарегистрирован в `app.module.ts`), два контроллера:
  - `UploadsController` — `POST /v1/uploads/image` (JWT, multipart, поле `file`; multer `limits.fileSize` 8 МБ + защита от OOM-DoS; MIME `jpg`/`png`/`webp`) → кладёт в **публичный** бакет через `Storage`-адаптер и возвращает `{ key }`.
  - `FilesController` — `GET /v1/files/public/:name` (**без авторизации**): отдаёт файл только из public-бакета, имя ограничено `^[a-z0-9]+\.(jpg|jpeg|png|webp)$` (защита от path-traversal), заголовки `X-Content-Type-Options: nosniff` и `Cache-Control: immutable`. Приватный бакет (селфи/дипломы, НФ-09) через этот роут **недоступен**. Клиент жмёт фото перед загрузкой (`apps/web/src/lib/image.ts`, НФ-08).
- **admin ↔ api**: только `admin/*`-эндпоинты по статическому токену; действия админа пишутся в аудит-лог (НФ-13).
- **Кроны — внутри api** (`@nestjs/schedule`), отдельного воркера нет: ежедневное списание подписки в 00:00 Asia/Almaty (Б-03…Б-05, пропуск до `subscriptionFreeUntil` — ADR-002), автозакрытия 24 ч (ЗВ-03/ЗВ-04), push «Смягчите фильтры» через 10 минут без откликов (Ф-08), очистка протухших OTP (НФ-05).

## 4. Стек по частям

### 4.1 apps/web — React PWA

> Стек фронта зафиксирован в **ADR-008** ([09-decisions.md](09-decisions.md)): клиент переведён с Flutter на React PWA. API-контур, модель данных и бизнес-правила при этом не меняются.

| Область | Библиотека |
|---|---|
| Сборка / рантайм | Vite 7 + React 19 + TypeScript |
| PWA | `vite-plugin-pwa` — манифест + service worker (устанавливаемость) |
| Навигация | React Router (все роуты S-01…S-35, см. [05-screens.md](05-screens.md)) |
| Серверное состояние | TanStack Query (кэш владеет server-state) |
| UI-состояние | Zustand |
| HTTP | `axios` (Bearer JWT, refresh-ротация) |
| Валидация | `zod` |
| Локализация | `i18next` / `react-i18next`: `ru` (канон) + `kk` (черновик, `// TODO native review`) — НФ-02 |
| Чат (WS) | `socket.io-client` (namespace `/chat`) |
| Стили | `sass` (SCSS) |
| Токены дизайна | `src/theme/tokens.ts` + `src/styles/tokens.scss` (CSS-переменные; значения — канон `design/standalone.html`, ADR-006) |
| Карты | тайлы через адаптер `MapTilesConfig` (OSM/2GIS/Google — [08-integrations.md](08-integrations.md)) |
| Геолокация | браузерный Geolocation API |
| Фото | File API (`<input type="file">`) + клиентское сжатие перед загрузкой (НФ-08) |
| Tinder-колода / моушн (§4.3, ADR-003) | pointer events + CSS-трансформы и анимации (аналог reanimated-физики) |

Визуальные токены (палитра, радиусы, типографика) — в [06-design-system.md](06-design-system.md); канон значений — `design/standalone.html` (хексы из ZOVU_PROMPT.md §4.1 устарели).

### 4.2 apps/api — NestJS

| Область | Технология |
|---|---|
| Фреймворк | NestJS 10 |
| ORM | Prisma |
| БД | PostgreSQL 15 + PostGIS (гео: `ST_DWithin` / `ST_Distance`) |
| Realtime | Socket.IO gateway, namespace `/chat` |
| Планировщик | `@nestjs/schedule` (кроны из §3) |
| Auth | JWT: access **15 мин** / refresh **30 дней**, ротация refresh (НФ-05) |
| Валидация | `class-validator` (DTO) |
| Документация | Swagger → экспорт `docs/api/openapi.json` ([04-api.md](04-api.md)) |
| Файлы | MinIO (S3-совместимый) локально; фоллбэк — локальная ФС (ADR-005, §8 ниже) |

### 4.3 apps/admin — web-админка

| Область | Технология |
|---|---|
| Сборка | Vite |
| UI | React + TypeScript |
| Таблицы | TanStack Table |
| Auth | статический админ-токен из `.env` (`ADMIN_TOKEN`), без пользователей |
| Дизайн | функциональный, без дизайн-требований |

Очереди админки: верификация, дипломы, пользовательские категории, жалобы на отзывы, тикеты поддержки + аудит-лог (НФ-13). TODO(M2): способ передачи `ADMIN_TOKEN` в запросах (заголовок `Authorization: Bearer` vs кастомный `X-Admin-Token`) в источниках не зафиксирован — решить при реализации и записать ADR.

## 5. Архитектура клиентского приложения (feature-first)

```
apps/web/src/
├── theme/         # tokens.ts + tokens.scss (палитра/радиусы из design/standalone.html), типографика, моушн
├── router/        # React Router: все S-роуты, диплинки, два таббар-шелла (заказчик/специалист)
├── api/           # axios-клиент, JWT-интерсепторы (refresh-ротация), socket.io-client, TanStack Query
├── i18n/          # i18next: ru (канон) + kk (// TODO native review)
├── components/    # общие UI-компоненты (UI-kit)
└── features/
    └── <feature>/ # auth, onboarding, orders, deck, bids, balance, chat, reviews,
        ├── ui/     #   support, notifications, profile, settings, ...
        ├── model/
        └── api/
```

Правила:
- Каждая фича изолирована в `src/features/<feature>/`; общее (тема, роутер, api, i18n, общие компоненты) — только в `src/{theme,router,api,i18n,components}/`.
- Никаких хардкод-строк UI — только ресурсы i18next (§11.4 промпта).
- Скрытый роут `/dev/uikit` со всеми компонентами UI-кита (майлстоун M1).
- Точный список фич и их экранов — [05-screens.md](05-screens.md).

## 6. Env-переменные (`.env.example` — полный канон)

| Переменная | Dev-значение | Назначение |
|---|---|---|
| `DATABASE_URL` | `postgresql://zovu:zovu_dev@localhost:5434/zovu` | Подключение Prisma. Docker-порт 5434; локальный PG без Docker — свой порт/креды (ADR-005) |
| `JWT_ACCESS_SECRET` | `dev_access_secret_change_me` | Секрет access-токена (TTL 15 мин, НФ-05) |
| `JWT_REFRESH_SECRET` | `dev_refresh_secret_change_me` | Секрет refresh-токена (TTL 30 дней, ротация) |
| `JWT_ACCESS_TTL` | `15m` | TTL access-токена |
| `JWT_REFRESH_TTL` | `30d` | TTL refresh-токена |
| `ADMIN_TOKEN` | `dev_admin_token_change_me` | Статический токен админки |
| `ORDER_COMMISSION_PCT` | `5` | Комиссия от цены принятого отклика, можно 0 (ADR-001) |
| `SUBSCRIPTION_PRICE` | `100` | Подписка специалиста, ₸/день (Б-03, БП-07) |
| `TZ` | `Asia/Almaty` | Часовой пояс кронов (списание в 00:00 Almaty) |
| `AUTO_APPROVE_VERIFICATION` | `true` | Dev: одобрение верификации через ~5 сек (S-07) |
| `DEV_OTP_CODE` | `1111` | Dev: OTP всегда `1111` + печать в лог API (S-03) |
| `SMS_PROVIDER` | `dev` | `dev` (лог в консоль) \| `mobizon` (заглушка) |
| `PAYMENT_PROVIDER` | `dev` | `dev` (мгновенный успех) \| `kaspi` (заглушка) |
| `PUSH_PROVIDER` | `dev` | `dev` (Notification + WS-эмит) \| `fcm` (заглушка) |
| `MODERATOR_PROVIDER` | `dev` | `dev` (стоп-словарь RU/KZ) \| `anthropic` (заглушка) — ОМ-01/ОМ-02 |
| `STORAGE_PROVIDER` | `minio` | `minio` \| `local` (фоллбэк без Docker, ADR-005) \| `s3` (заглушка) |
| `MINIO_ENDPOINT` | `http://localhost:9000` | Адрес MinIO (при `STORAGE_PROVIDER=minio`) |
| `MINIO_ACCESS_KEY` | `zovu` | Ключ MinIO |
| `MINIO_SECRET_KEY` | `zovu_dev_secret` | Секрет MinIO |
| `MINIO_BUCKET_PUBLIC` | `zovu-public` | Публичный бакет: фото заказов |
| `MINIO_BUCKET_PRIVATE` | `zovu-private` | Приватный бакет: документы верификации/дипломы (НФ-09) |
| `LOCAL_STORAGE_DIR` | `.storage` | Каталог при `STORAGE_PROVIDER=local` |
| `PORT` | `3000` | Порт API |

Секреты — только в `.env`; `.env.example` держим полным (§11.6 промпта).

## 7. Команды запуска (ZOVU_PROMPT.md §11.8)

```bash
# Инфраструктура (машины с Docker; без Docker — см. §8)
docker compose up -d                 # postgres+postgis :5434, minio :9000/:9001

# API
cd apps/api && npx prisma migrate dev && npm run start:dev   # :3000
cd apps/api && npm test              # jest — бизнес-правила (список в 07-business-rules.md)

# Web (клиент — PWA)
cd apps/web && npm run dev           # Vite dev-server :5173 (proxy /v1 и /chat → :3000)
cd apps/web && npm run build         # прод-сборка PWA (манифест + service worker)
cd apps/web && npm run typecheck     # tsc — 0 ошибок перед коммитом

# Admin
cd apps/admin && npm run dev
```

API-контейнер в docker-compose — под профилем `full` (`docker compose --profile full up -d`); базовый сценарий — API на хосте.

## 8. Особенности dev-машины (важно — ADR-005)

Текущая машина разработки:

- **ОС**: Windows 11.
- **Node**: v22.14.
- **Docker НЕ установлен** — `docker compose up -d` на этой машине не работает.
- **Клиент — web** (React PWA `apps/web`), запускается в браузере — отдельный нативный тулчейн не нужен; демо «на двух устройствах» = две вкладки браузера.
- **Локальный PostgreSQL 17** установлен как Windows-служба `postgresql-x64-17`.

Фоллбэки (зафиксированы как ADR-005 в [09-decisions.md](09-decisions.md)):

1. `docker-compose.yml` остаётся **каноном для машин с Docker** — его не ломаем.
2. Без Docker: БД — локальный PG17 (свой `DATABASE_URL`), файлы — Storage-адаптер на локальной ФС (`STORAGE_PROVIDER=local`, `LOCAL_STORAGE_DIR=.storage`). Приватность документов (НФ-09) обеспечивает адаптер: файлы приватного «бакета» отдаются только админ-эндпоинтам.
3. Если **PostGIS на PG17 недоступен** — гео-запросы реализуются через contrib-расширения `cube`/`earthdistance`, спрятанные за гео-интерфейсом, чтобы код выше не зависел от реализации. Детали и последствия — [09-decisions.md](09-decisions.md), ADR-005.

## 9. Связанные страницы

- [01-scope.md](01-scope.md) — скоуп и исключения B2B
- [03-data-model.md](03-data-model.md) — ERD и инварианты Prisma-схемы
- [04-api.md](04-api.md) — эндпоинты, WS-события, `openapi.json`
- [06-design-system.md](06-design-system.md) — токены и UI-kit (канон — `design/standalone.html`)
- [07-business-rules.md](07-business-rules.md) — state machine, подписка/комиссия, кроны как бизнес-правила
- [08-integrations.md](08-integrations.md) — интерфейсы провайдеров и dev-моки
- [09-decisions.md](09-decisions.md) — ADR-001 (комиссия), ADR-002 (freeUntil), ADR-005 (dev-машина), ADR-008 (React PWA вместо Flutter)
- [10-status.md](10-status.md) — прогресс по майлстоунам M0–M8
