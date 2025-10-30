import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const zonesRouter = (await import('express')).default.Router();

zonesRouter.get('/', async (req, res, next) => {
  try {
    const zonas = await prisma.zona.findMany({ include: { _count: { select: { butacas: true } } } });
    res.json(zonas);
  } catch (e) { next(e); }
});

export default zonesRouter;
