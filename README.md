# Ingetin

Monorepo TypeScript untuk aplikasi WhatsApp Reminder. Repo ini berisi API Fastify, web React/Vite, paket shared types, Prisma database package, dan konfigurasi Docker untuk Postgres/Redis.

## Struktur

- `apps/whatsapp-reminder/api` - backend Fastify, worker, queue, Prisma integration
- `apps/whatsapp-reminder/web` - frontend React, Vite, Tailwind
- `packages/database` - Prisma schema, migrations, seed
- `packages/env`, `packages/logger`, `packages/types`, `packages/config` - package shared
- `deploy` - Docker infra, init DB, script deploy

## Prasyarat

- Node.js 22.x direkomendasikan
- npm 10.8.2
- Docker Desktop, jika ingin menjalankan Postgres dan Redis lokal
- Git

## Setup Lokal

1. Clone repo.

```bash
git clone https://github.com/nakatarinabluu/ingetin.git
cd ingetin
```

2. Install dependency.

```bash
npm install
```

3. Buat env lokal dari template.

```bash
cp .env.example .env
```

Isi nilai secret di `.env`. Untuk development terminal lokal, gunakan host `localhost`:

```env
DATABASE_URL=postgresql://ingetin:change-me-postgres-password@localhost:5432/ingetin_whatsapp_db?schema=public
REDIS_URL=redis://default:change-me-redis-password@localhost:6379
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:4000
```

4. Siapkan env Docker untuk Postgres dan Redis.

```bash
cp deploy/env/infra-postgres.env.example deploy/env/infra-postgres.env
cp deploy/env/infra-redis.env.example deploy/env/infra-redis.env
cp deploy/env/whatsapp-reminder-api.env.example deploy/env/whatsapp-reminder-api.env
```

Samakan password di `deploy/env/*.env` dengan `.env` kalau menjalankan API dari terminal lokal.

5. Jalankan database dan Redis.

```bash
docker compose up -d postgres redis
```

6. Generate Prisma client dan apply schema.

```bash
npm run generate -w @ingetin/database
npm run db:push -w @ingetin/database
```

Opsional seed:

```bash
npm run db:seed -w @ingetin/database
```

7. Jalankan development server.

```bash
npm run dev
```

Web berjalan di `http://localhost:5173`, API di `http://localhost:4000`.

## Docker Compose Full App

Untuk menjalankan Postgres, Redis, dan API lewat Docker:

```bash
cp deploy/env/infra-postgres.env.example deploy/env/infra-postgres.env
cp deploy/env/infra-redis.env.example deploy/env/infra-redis.env
cp deploy/env/whatsapp-reminder-api.env.example deploy/env/whatsapp-reminder-api.env
docker compose up -d --build
```

Di mode Docker, `DATABASE_URL` harus memakai host `ingetin-db`, dan `REDIS_URL` harus memakai host `ingetin-redis`.

## Script Penting

- `npm run dev` - menjalankan semua workspace yang punya script `dev`
- `npm run build` - build semua workspace via Turbo
- `npm run lint` - lint semua workspace via Turbo
- `npm run test -w @ingetin/api` - test API
- `npm run generate -w @ingetin/database` - generate Prisma client
- `npm run db:push -w @ingetin/database` - apply Prisma schema ke database
- `npm run db:studio -w @ingetin/database` - buka Prisma Studio

## Catatan GitHub

File yang harus masuk GitHub:

- source code di `apps`, `packages`, `scripts`, dan `deploy/infra`
- `package.json`, `package-lock.json`, `turbo.json`, `tsconfig*.json`
- `.env.example`
- `deploy/env/*.env.example`
- `README.md`

File yang jangan masuk GitHub:

- `.env`
- `deploy/env/*.env`
- `node_modules`
- `.turbo`
- `deploy/data`
- `dist`, `build`, report test, cache, dan secret key/certificate

Untuk kerja di PC lain, clone repo, copy template env, isi secret pribadi, lalu jalankan langkah setup lokal di atas.
