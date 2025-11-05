import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/seats', async (req, res) => {
  try {
    const seats = await prisma.butaca.findMany({
      include: { zona: true } // 👈 Esto ya estaba correcto
    });

    const simplifiedSeats = seats.map(seat => ({
      id: seat.id,
      fila: seat.fila,
      columna: seat.columna,
      disponible: seat.disponible,
      estadoReserva: seat.estadoReserva,
      reservaHasta: seat.reservaHasta,
      zonaId: seat.zonaId,
      zona: seat.zona ? seat.zona.nombre : null, // 👈 AGREGAR ESTO
      ventaId: seat.ventaId,
    }));

    res.json(simplifiedSeats);
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

export default router;
