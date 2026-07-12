# ZuriKaribu Sellers Platform

A full-featured web platform for African fashion designers and fabric sellers.

## Features
- Seller registration (4-step interactive form)
- Email/password + Google OAuth authentication
- Product management with S3 image uploads (3-5 images)
- AI-powered description optimization (GPT-4o)
- Multi-platform auto-publish: Instagram, TikTok, Facebook, eBay
- Admin dashboard with full user, product, and platform management
- Admin-managed app settings (markup %, platform toggles)

## Prerequisites
- Node.js 20.19+ (22.x recommended)
- Docker Desktop (or Docker Engine + Compose) for local PostgreSQL

## Quick Start (local)

```bash
cd seller
npm install

# 1. Start local Postgres
npm run db:up

# 2. Configure environment
cp .env.example .env
# Edit .env if needed — DATABASE_URL already matches docker-compose defaults.
# Generate a secret: openssl rand -base64 32

# 3. Create schema + seed admin
npm run db:migrate
npm run db:seed

# 4. Run the app
npm run dev
```

App: http://localhost:3000  
Admin: `admin@zurikaribu.com` / `Admin@ZuriKaribu2024!` (change immediately)

### Database commands

| Command | Description |
|---|---|
| `npm run db:up` | Start Postgres in Docker |
| `npm run db:down` | Stop Postgres (keeps data) |
| `npm run db:reset` | Wipe volume and recreate DB |
| `npm run db:logs` | Tail Postgres logs |
| `npm run db:migrate` | Run Prisma migrations + generate client |
| `npm run db:seed` | Seed admin user and default settings |
| `npm run db:studio` | Open Prisma Studio |

Default Docker credentials (see `docker-compose.yml`):

- Host: `localhost:5432`
- User / password / DB: `zurikaribu` / `zurikaribu` / `zurikaribu`
- URL: `postgresql://zurikaribu:zurikaribu@localhost:5432/zurikaribu?schema=public`

Google OAuth, AWS S3, and OpenAI keys are optional for basic local auth and browsing; fill them in `.env` when you need those features.

### Troubleshooting

**`P1012: Argument "url" is missing in data source block "db"`**  
You are running Prisma 6 against a Prisma 7 schema. Confirm the local CLI:

```bash
npx prisma -v
# expect prisma : 7.8.0
```

Then reinstall from a clean tree:

```bash
rm -rf node_modules package-lock.json
npm install
```

This project keeps the DB URL in `prisma.config.ts` (Prisma 7), not in `schema.prisma`.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL
- NextAuth.js v5 (Google + Credentials)
- AWS S3 for image storage
- OpenAI GPT-4o for AI features

See `.env.example` for all environment variables.
