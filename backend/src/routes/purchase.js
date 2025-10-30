import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = (await import('express')).default.Router();

router.post('/', async (req, res, next) => {
  try {
    const { compradorNombre, compradorEmail, butacaIds } = req.body;
    if (!compradorNombre || !compradorEmail || !Array.isArray(butacaIds) || butacaIds.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const seats = await prisma.butaca.findMany({ where: { id: { in: butacaIds } } });
    if (seats.length !== butacaIds.length) return res.status(400).json({ error: 'Alguna butaca no existe' });
    if (seats.some(s => !s.disponible)) return res.status(409).json({ error: 'Alguna butaca ya fue tomada' });

    const zonasIds = [...new Set(seats.map(s => s.zonaId))];
    const zonas = await prisma.zona.findMany({ where: { id: { in: zonasIds } } });
    const precios = Object.fromEntries(zonas.map(z => [z.id, z.precio]));
    const total = seats.reduce((acc, s) => acc + (precios[s.zonaId] || 0), 0);

    const venta = await prisma.$transaction(async (tx) => {
      const nv = await tx.venta.create({
        data: { compradorNombre, compradorEmail, total }
      });
      for (const sid of butacaIds) {
        await tx.ventasButacas.create({ data: { ventaId: nv.id, butacaId: sid } });
        await tx.butaca.update({ where: { id: sid }, data: { disponible: false } });
      }
      return nv;
    });

    res.json({ ok: true, ventaId: venta.id, total });
  } catch (e) { next(e); }
});

export default router;
