# 10 — Статус проекта

> Снимок прогресса Zovu на **2026-07-05**.
>
> **Правило ведения:** эта страница обновляется после **каждого** майлстоуна (см. [ZOVU_PROMPT.md](../ZOVU_PROMPT.md) §3, правило 2 и §10). Вместе с ней обновляются все затронутые страницы вики; любое отступление от промпта фиксируется как ADR в [09-decisions.md](09-decisions.md).

Навигация: [00-overview.md](00-overview.md) · [01-scope.md](01-scope.md) · [02-architecture.md](02-architecture.md) · [09-decisions.md](09-decisions.md)

---

## 1. Майлстоуны M0–M8

Названия и состав — из ZOVU_PROMPT.md §10 (source of truth плана работ).

| # | Майлстоун | Статус | Кратко |
|---|---|---|---|
| M0 | **Phase 0: `docs/` вики + `CLAUDE.md` + скелет монорепо + docker-compose (postgres+postgis, minio) + `.env.example`** | ✅ done | Вики (12 страниц) написана и проверена двумя критиками, design-ассеты латиницей, скелет монорепо (apps/api, apps/admin, apps/web) собран, `docker-compose`/`.env.example`/`CLAUDE.md`/`README` на месте, `apps/web` собирается. |
| M1 | **Дизайн-система React** | ✅ done | Дизайн-токены (`tokens.ts` + `tokens.scss`), UI-kit из 18 компонентов (Button, TextField/TextArea, OtpInput, StatusPill, Chip, Card, Price, Badge, Avatar, SegmentedControl, BottomSheet, ProgressBar, TabBar, Switch, EmptyState, Screen, AppBar, Icon) — значения сверены с точной спецификацией standalone, два таббар-шелла (специалист/заказчик) + `DeviceFrame`, каркас React Router со всеми S-роутами S-01…S-35 (заглушки `ScreenStub`), i18next ru/kk (типобезопасный), витрина `/dev/uikit`. `npm run build` зелёный. |
| M2 | **API-ядро** | ⏳ pending | Prisma-схема + миграции, auth OTP+JWT (НФ-05), users/roles, категории + seed, Swagger (экспорт `openapi.json`). |
| M3 | **Онбординг** | ⏳ pending | S-01…S-08 end-to-end, загрузка файлов в MinIO, очередь верификации в админке, `AUTO_APPROVE_VERIFICATION` для dev, дипломы (ДС-*). |
| M4 | **Заказы** | ⏳ pending | Создание с фото и гео, PostGIS-выдача feed/map (фильтры Ф-02…Ф-05, блок «Новые» С-03/С-04), колода со свайпами, карточка заказа, отклики + каскад «Не выбран», экраны S-22…S-24. |
| M5 | **Деньги** | ⏳ pending | Транзакции, cron подписки (Б-03…Б-05, + `subscriptionFreeUntil`), пополнение-мок, блокировки S-17 (БП-02/БП-06), активация БП-07, комиссия при принятии (ADR-001), экраны S-15/S-16, streak. |
| M6 | **Сделка** | ⏳ pending | Чат WS + read-статусы (Ч-*), уведомления (лента + бейдж, НФ-06), завершение с таймерами 24 ч (ЗВ-02/ЗВ-03/ЗВ-04), отзывы + стоп-словарь + жалобы (О-*, ОМ-*), S-25…S-27, S-30, S-32, S-33. |
| M7 | **Поддержка** | ⏳ pending | S-31 + админ-очередь тикетов (СП-*), роль/настройки (S-34, S-35, Р-*), админка целиком (5 очередей + аудит-лог НФ-13), отмена/спор заказа (ЗВ-06/ЗВ-07). |
| M8 | **Polish** | ⏳ pending | Анимации/haptics/empty states по §4 промпта, seed демо-данных (Алматы), e2e happy-path скрипт, финальное обновление вики и README. |

```mermaid
flowchart LR
    M0["M0 — Phase 0<br/>✅ done"] --> M1["M1 — Дизайн-система React<br/>✅ done"]
    M1 --> M2["M2 — API-ядро"]
    M2 --> M3["M3 — Онбординг"]
    M3 --> M4["M4 — Заказы"]
    M4 --> M5["M5 — Деньги"]
    M5 --> M6["M6 — Сделка"]
    M6 --> M7["M7 — Поддержка"]
    M7 --> M8["M8 — Polish"]
    style M0 fill:#EEF1FF,stroke:#4C6FFF,color:#141824
    style M1 fill:#EEF1FF,stroke:#4C6FFF,color:#141824
```

**Гейт выхода из каждого M** (ZOVU_PROMPT.md §10): `apps/web` собирается (`npm run build` без ошибок) + ESLint/Prettier, jest-тесты бизнес-правил зелёные, обновлён этот файл, один conventional commit (пример: `feat(m4): orders, deck & bids`).

---

## 2. Сделано (на 2026-07-05)

- **git init** в `mvp3` — репозиторий инициализирован, ветка `main`.
- **Design-ассеты скопированы с латинскими именами** — экспорт из Claude Design (`design/standalone.html`, `canvases/`, `screenshots/`, `mockups/`, `_ds/`) перенесён в репо; файлы с `#U….`-escape'ами/кириллицей переименованы латиницей, маппинг зафиксирован в **ADR-004** ([09-decisions.md](09-decisions.md)).
- **Палитра извлечена из `design/standalone.html`** — канон цветов/радиусов (primary `#4C6FFF` и т.д.), заменяющий устаревшие хексы ZOVU_PROMPT.md §4.1 (`#2563EB` и др.), зафиксирован как **ADR-006**; токены описаны в [06-design-system.md](06-design-system.md).
- **Стек фронта: React PWA вместо Flutter** — клиентское приложение переехало с Flutter на Vite + React + TS PWA (`apps/mobile` → `apps/web`); зафиксировано как **ADR-008** ([09-decisions.md](09-decisions.md)). Бэкенд, модель данных, API-контур и бизнес-правила не меняются.
- **Вики написана и проверена** — 12 страниц (00–10 + [glossary.md](glossary.md)), прошли две независимые критические вычитки (Phase 0, эта страница включительно).
- **Скелет монорепо собран** — `apps/api` (NestJS), `apps/admin` (Vite + React), `apps/web` (React PWA).
- **Инфра и конфиги на месте** — `docker-compose.yml` (postgres+postgis, minio), `.env.example`, корневой `CLAUDE.md`, `README`.
- **Дизайн-токены сгенерированы** — `apps/web/src/theme/tokens.ts` + `tokens.scss` (значения — канон standalone, ADR-006).
- **`apps/web` собирается** — `npm run build` проходит без ошибок (зелёный).
- **M1 — дизайн-система React готова** — UI-kit из 18 компонентов (`src/components/ui/*`, значения сверены с точной спецификацией `standalone.html`), два таббар-шелла + `DeviceFrame`, React Router со всеми S-роутами (заглушки `ScreenStub`), типобезопасный i18next (ru-канон + kk-черновик), витрина `/dev/uikit`, утилиты (haptics через Web Vibration API, форматтеры ₸/расстояние/комиссия), линейный SVG-набор иконок. Извлечён точный спек компонентов из standalone (агент); зафиксировано **ADR-009** (точечное исключение по градиенту: balance card, аватары, success-иллюстрации).

---

## 3. Дальше

1. **M2 — API-ядро:** Prisma-схема + миграции (проверить PostGIS/фоллбэк на локальном PG17), auth OTP+JWT (НФ-05), users/roles, категории + seed, Swagger → экспорт `docs/api/openapi.json`.

Дальше по цепочке M3 → M8 без пауз на подтверждение (правило работы №1 из ZOVU_PROMPT.md §11).

---

## 4. Известные риски и долги

| Риск / долг | Детали | Митигция / где отслеживается |
|---|---|---|
| **Docker не установлен на машине** | `docker compose up` для postgres+postgis и minio может не подняться локально. | **ADR-005** в [09-decisions.md](09-decisions.md) — фоллбэки (локальный PG, файловое хранилище вместо MinIO в dev). |
| **Клиент — PWA, не натив** | Клиентское приложение — React PWA (две вкладки браузера вместо двух устройств для демо), нативной сборки под iOS/Android в MVP нет. | Подход зафиксирован **ADR-008**; API стек-независим, поэтому нативный порт (напр., Flutter) возможен позже поверх того же бэкенда без его переработки. |
| **PostGIS на локальном PG17 не проверен** | Гео-запросы `ST_DWithin`/`ST_Distance` (M4, фильтр Ф-05, выдача feed/map) не прогонялись на локальном PostgreSQL 17. | Проверить при старте M2 (миграции); фоллбэк на `cube`/`earthdistance` за интерфейсом гео-репозитория — **ADR-005**. |
| **kk-переводы черновые** | Все казахские строки в ресурсах i18next — машинный черновик с пометкой `// TODO native review` (правило №4, ZOVU_PROMPT.md §11). | Нативная вычитка до релиза; трекается в ресурсах i18next (kk). |
| **`openapi.json` ещё не существует** | [04-api.md](04-api.md) ссылается на `docs/api/openapi.json`, который появится только в **M2** (экспорт из Swagger). | До M2 контур API — по [04-api.md](04-api.md). |

---

## 5. История обновлений страницы

| Дата | Событие |
|---|---|
| 2026-07-05 | Страница создана в рамках M0 (Phase 0). Статус: M0 in progress, M1–M8 pending. |
| 2026-07-05 | M0 закрыт (✅ done): скелет монорепо (apps/api, apps/admin, apps/web), docker-compose, .env.example, CLAUDE.md, README, дизайн-токены, `apps/web` собирается. Учтён **ADR-008** (Flutter → React PWA): M1 стал «Дизайн-система React», секции «Сделано», «Дальше» и «Риски» обновлены. |
| 2026-07-05 | M1 закрыт (✅ done): UI-kit (18 компонентов), 2 таббар-шелла + DeviceFrame, React Router (все S-роуты, заглушки), i18next ru/kk, `/dev/uikit`, утилиты/иконки. Извлечён точный спек компонентов из standalone; добавлен **ADR-009** (исключение по градиенту). `npm run build` зелёный. Следующий — M2 (API-ядро). |
