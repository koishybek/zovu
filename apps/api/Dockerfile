# Zovu API — образ для docker-compose профиля `full`.
# Для dev API обычно запускается на хосте (npm run start:dev), см. CLAUDE.md.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate || true
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
