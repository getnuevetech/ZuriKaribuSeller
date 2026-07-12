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

## Quick Start

```bash
cd seller
npm install
cp .env.example .env  # Fill in your values
npm run db:migrate
npm run seed
npm run dev
```

Admin: admin@zurikaribu.com / Admin@ZuriKaribu2024! (change immediately)

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL
- NextAuth.js v5 (Google + Credentials)
- AWS S3 for image storage
- OpenAI GPT-4o for AI features

See .env.example for all required environment variables.
