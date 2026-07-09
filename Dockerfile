FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN echo 'DATABASE_URL="postgresql://localhost:5432/app"' > .env

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN rm -f .env

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN mkdir -p /app/public/temp

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
