# Zovu API — образ для docker-compose профиля `full` и облачного деплоя (Railway/Render/Fly).
# apps/api самодостаточен (свой package.json), контекст сборки = папка apps/api.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
# start:prod = prisma migrate deploy && node dist/main (миграции на прод-БД при старте).
# DATABASE_URL/JWT_*/ADMIN_TOKEN/CORS_ORIGIN/LOCAL_STORAGE_DIR — из env хостинга.
CMD ["npm", "run", "start:prod"]
