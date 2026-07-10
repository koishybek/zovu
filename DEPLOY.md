# Деплой Zovu (демо для заказчика)

Приложение — **не** чистая статика: у него живой NestJS-бэкенд с WebSocket-чатом,
cron-задачами и PostgreSQL. Поэтому «только Vercel» не подходит. Рабочая схема:

```
Фронт (apps/web, статика PWA)        →  Vercel
Бэкенд (apps/api, always-on Node)    →  Railway
PostgreSQL + том для файлов          →  Railway
```

Оба приложения **самодостаточны** (свой package.json, без npm-workspaces), поэтому
собираются независимо. Ниже — по шагам. Предполагается, что репозиторий залит на GitHub
(Railway и Vercel деплоят из GitHub). Альтернатива без GitHub — CLI (`railway up`, `vercel`)
из папок `apps/api` и `apps/web` соответственно.

---

## 1. Бэкенд + БД на Railway

1. **Проект и БД.** railway.app → *New Project* → *Deploy from GitHub repo* (выбрать этот репо).
   В проекте: *+ New* → *Database* → **PostgreSQL** (создастся с переменной `DATABASE_URL`).
2. **Сервис API.** У сервиса из репозитория:
   - **Settings → Root Directory:** `apps/api` (там свой `Dockerfile` — Railway соберёт по нему).
   - **Settings → Networking → Generate Domain** → получите `https://zovu-api-xxxx.up.railway.app`.
   - **Storage → Volume** → примонтировать том, mount path `/data` (чтобы фото заказов и
     документы верификации переживали редеплой; ФС контейнера иначе эфемерна).
3. **Переменные окружения** сервиса API (Variables):

   | Переменная | Значение | Зачем |
   |---|---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | подключение к БД (ссылка на плагин) |
   | `JWT_ACCESS_SECRET` | *(случайная строка 32+)* | подпись access-токена |
   | `JWT_REFRESH_SECRET` | *(другая случайная 32+)* | подпись refresh-токена |
   | `ADMIN_TOKEN` | *(случайная строка)* | вход в админку `apps/admin` |
   | `CORS_ORIGIN` | `https://<домен-с-Vercel>` | разрешить фронту ходить в API (задать после шага 2) |
   | `LOCAL_STORAGE_DIR` | `/data/storage` | файлы на примонтированный том |
   | `AUTO_APPROVE_VERIFICATION` | `true` | демо: верификация одобряется за ~5 c |
   | `DEV_OTP_CODE` | `1111` | демо: вход по коду `1111` без реальной SMS |
   | `SMS_PROVIDER` | `dev` | не слать реальные SMS |
   | `EXPORT_OPENAPI` | `false` | не писать openapi.json в рантайме |
   | `TZ` | `Asia/Almaty` | таймзона cron (списание подписки в 00:00) |

   `PORT` Railway задаёт сам — код читает `process.env.PORT`. Секреты сгенерировать, напр.:
   `openssl rand -hex 32`.
4. **Один инстанс.** Оставить replicas = 1 (cron списания подписки и автозакрытия + Socket.IO
   в памяти — при нескольких инстансах будет двойное списание). Для масштабирования позже —
   sticky-сессии + Redis-adapter + вынесенный планировщик.
5. **Миграции** применяются автоматически при старте (`start:prod` = `prisma migrate deploy && node dist/main`).
6. **Демо-данные.** Один раз засеять прод-БД (именно на Railway, чтобы фото легли на том):
   Railway → сервис API → *Shell* (или `railway run`) → `npm run seed:demo`.
   Создаст 6 специалистов Алматы, заказы, принятую сделку с чатом и завершённый заказ.

## 2. Фронт на Vercel

1. vercel.com → *Add New → Project* → импортировать этот репо.
2. **Root Directory:** `apps/web`. Framework Preset определится как **Vite** (build `npm run build`,
   output `dist`). SPA-фолбэк уже описан в `apps/web/vercel.json`.
3. **Environment Variables:**
   - `VITE_API_URL` = `https://zovu-api-xxxx.up.railway.app` (домен API с шага 1.2, **без** `/` в конце и без `/v1`).
   - `VITE_DEMO` = `true` (показать «Быстрый вход (demo)» на Welcome для клиента).
4. **Deploy** → получите `https://zovu-xxxx.vercel.app`.
5. Вернуться на Railway и выставить `CORS_ORIGIN` = этот домен Vercel → сервис перезапустится.

## 3. Проверка

Открыть `https://zovu-xxxx.vercel.app`:
- на Welcome — **«Быстрый вход (demo)»** обеими ролями в одно касание;
- либо вручную: телефон → код **`1111`**.

Демо-аккаунты: заказчик `+7 700 000 0000`, специалисты `+7 701 000 0001 … 0006`.

Проверить сквозной путь: заказ → отклики → принять/контрпредложение → чат (WebSocket) → завершить → оценить.

## 4. Важные оговорки (демо, не прод)

- **Dev-режим входа оставлен намеренно** для показа: код `1111`, авто-верификация. Для реального
  прода — отключить (`AUTO_APPROVE_VERIFICATION=false`, `DEV_OTP_CODE=` пусто, подключить реальный
  SMS-провайдер Mobizon и убрать `VITE_DEMO`).
- **Файлы** живут на томе Railway. Без тома они пропадут при редеплое — тогда просто пересеять
  (`npm run seed:demo`).
- **Платежи** — вне скоупа (пополнение/подписка — мок).
- Админка (`apps/admin`) при желании тоже деплоится на Vercel (Root `apps/admin`, статический
  токен `ADMIN_TOKEN` из env), но для клиентского демо не обязательна.
