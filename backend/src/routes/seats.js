import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/seats', async (req, res) => {
    try {
        const seats = await prisma.butaca.findMany({
            // Incluimos la zona para que el frontend pueda obtener precio y color
            include: {
                zona: true
            }
        });

        // Mapeamos para aplanar la estructura de datos y hacerla más fácil de usar en React
        const simplifiedSeats = seats.map(seat => ({
            id: seat.id,
            fila: seat.fila,
            columna: seat.columna,
            disponible: seat.disponible,
            // Nuevos campos de reserva
            estadoReserva: seat.estadoReserva,
            reservaHasta: seat.reservaHasta,
            // Incluir el ID de la zona para el mapeo de colores/precios en el frontend
            zonaId: seat.zonaId, 
            
            // Opcional: para debug, incluye temporalmente la info de venta
            ventaId: seat.ventaId 
        }));

        res.json(simplifiedSeats);
    } catch (error) {
        console.error("Error fetching seats:", error);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
});

// ¡CAMBIO CLAVE: Exportación por defecto!
export default router;
