import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import seatsRouter from './routes/seats.js';
import zonesRouter from './routes/zones.js';
import purchaseRouter from './routes/purchase.js';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.ORIGIN || '*';

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

app.get('/', (req, res) => res.send('🎭 API Teatro funcionando. Visita /api/health, /api/zones, /api/seats'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/zones', zonesRouter);
app.use('/api/seats', seatsRouter);
app.use('/api/purchase', purchaseRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
