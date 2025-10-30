# Sistema de Venta de Entradas — v2

- Backend: Node + Express + Prisma (SQLite en dev)
- Frontend: Vite + React
- Zonas y precios según plano (Platea Baja $25k; Palcos Gold $25k; VIP/ Superiores $20k)

## Pasos
1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```
2) Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Abrí `http://localhost:5173`. El mapa se dibuja con bloques, colores y ángulos.
