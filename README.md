# LMS

MVP-first learning management system (Next.js, Prisma, PostgreSQL, Better Auth) designed to grow into a multi-tenant SaaS.

## Getting started
1. `cp .env.example .env` and fill in `DATABASE_URL` and `BETTER_AUTH_SECRET`
2. `npm install`
3. `npm run db:migrate -- --name init`
4. `npm run db:seed`
5. `npm run dev`

Seed accounts (password from `SEED_PASSWORD`): admin@, instructor@, student@example.com

## Docs
ARCHITECTURE.md, DATABASE_SCHEMA.md, FUTURE_ROADMAP.md (added as phases complete)
