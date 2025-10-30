# Tickets Backend v2

## Setup
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```
Endpoints: `/api/health`, `/api/zones`, `/api/seats`, `/api/purchase`
