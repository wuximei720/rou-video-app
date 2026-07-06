FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/prisma ./prisma

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /app/public/temp

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
