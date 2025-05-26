# Creator: Privacy-First Collaboration App

## Monorepo Structure

- `frontend/` – Vite + React (UI)
- `backend/` – Fastify (TypeScript, API)
- `prisma/` – Prisma schema & migrations

## Setup

1. **Frontend**
   - `cd frontend && npm install && npm run dev`

2. **Backend**
   - `cd backend && npm install`
   - (Backend code will be added soon)

3. **Prisma**
   - `cd prisma && npm install`
   - Configure your database in `prisma/prisma/.env` (see below)
   - `npx prisma migrate dev` (after schema is ready)

## .env Files

- **Do not fill in .env values yet.**
- You will be told exactly where to put each variable at the end of setup.

---

This project is a privacy-first, Signal-grade secure collaboration app with encrypted chat, file sharing, plugin extensibility, and a clean, modern UI. 