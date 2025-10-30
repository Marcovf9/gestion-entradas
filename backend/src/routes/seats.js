import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = (await import('express')).default.Router();

router.get('/', async (req, res, next) => {
  try {
    const seats = await prisma.butaca.findMany({ include: { zona: true } });
    res.json(seats);
  } catch (e) { next(e); }
});

export default router;
