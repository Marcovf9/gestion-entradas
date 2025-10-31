import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();
const RESERVATION_DURATION_MINUTES = 30; // 30 minutos de reserva temporal

/**
 * Función auxiliar para obtener el tiempo de expiración
 * @returns {Date} Fecha de expiración (hora actual + RESERVATION_DURATION_MINUTES)
 */
const getExpiryTime = () => {
    return new Date(Date.now() + RESERVATION_DURATION_MINUTES * 60 * 1000);
};

// =========================================================================
// 1. ENDPOINT PARA CREAR UNA RESERVA TEMPORAL (USADO POR EL CLIENTE)
// =========================================================================

router.post('/reserve', async (req, res) => {
    const { butacaIds, compradorNombre, compradorEmail } = req.body;

    if (!butacaIds || butacaIds.length === 0 || !compradorNombre || !compradorEmail) {
        return res.status(400).json({ error: 'Faltan butacaIds, compradorNombre o compradorEmail.' });
    }

    try {
        // 1. Verificar si alguna butaca ya está vendida o reservada activamente
        const conflictingSeats = await prisma.butaca.findMany({
            where: {
                id: { in: butacaIds.map(Number) },
                OR: [
                    { disponible: false }, // Vendida
                    { estadoReserva: 'RESERVED', reservaHasta: { gt: new Date() } } // Reservada y no expirada
                ]
            },
            select: { id: true, fila: true, columna: true }
        });

        if (conflictingSeats.length > 0) {
            const conflictDetails = conflictingSeats.map(s => `F${s.fila}-A${s.columna} (ID: ${s.id})`);
            return res.status(409).json({ 
                error: 'Conflicto de butacas', 
                message: 'Alguna de las butacas seleccionadas ya fue vendida o reservada recientemente.',
                unavailableIds: conflictDetails
            });
        }

        // 2. Crear ID y tiempo de expiración
        const reservaId = randomUUID();
        const reservaHasta = getExpiryTime();
        // Guardamos la información del comprador en formato JSON string, ya que compradorTemp es un String
        const compradorTemp = JSON.stringify({ nombre: compradorNombre, email: compradorEmail });

        // 3. Aplicar la reserva temporal en una transacción
        await prisma.$transaction(
            butacaIds.map(id => prisma.butaca.update({
                where: { id: Number(id) },
                data: {
                    estadoReserva: 'RESERVED',
                    reservaId: reservaId,
                    reservaHasta: reservaHasta,
                    compradorTemp: compradorTemp,
                }
            }))
        );

        res.status(200).json({ 
            message: 'Reserva temporal creada.',
            reservaId, 
            reservaHasta 
        });

    } catch (error) {
        console.error("Error al crear la reserva:", error);
        res.status(500).json({ error: 'Error interno al procesar la reserva.' });
    }
});

// =========================================================================
// 2. ENDPOINT PARA CONFIRMACIÓN MANUAL DE VENTA (USADO POR EL ADMIN)
// =========================================================================

router.post('/admin/confirm-purchase', async (req, res) => {
    const { reservaId } = req.body;

    if (!reservaId) {
        return res.status(400).json({ error: 'reservaId es requerido para la confirmación.' });
    }

    try {
        // 1. Encontrar las butacas reservadas con ese ID
        const reservedSeats = await prisma.butaca.findMany({
            where: { reservaId, estadoReserva: 'RESERVED' },
        });

        if (reservedSeats.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada, ya expiró o ya fue vendida.' });
        }
        
        // 2. Crear el registro de Venta permanente
        const butacaIds = reservedSeats.map(s => s.id);
        
        // Deserializar la información del comprador de una de las butacas (asumiendo que es la misma para todas)
        const compradorInfo = JSON.parse(reservedSeats[0].compradorTemp);
        
        const venta = await prisma.venta.create({
            data: {
                compradorNombre: compradorInfo.nombre,
                compradorEmail: compradorInfo.email,
                butacas: {
                    connect: reservedSeats.map(seat => ({ id: seat.id }))
                }
            }
        });

        // 3. Actualizar las butacas: marcar como no disponibles, limpiar campos de reserva y asignar ventaId
        await prisma.butaca.updateMany({
            where: { id: { in: butacaIds } },
            data: {
                disponible: false,
                estadoReserva: null,
                reservaId: null,
                reservaHasta: null,
                compradorTemp: null,
                ventaId: venta.id
            }
        });

        res.status(200).json({ 
            message: 'Venta confirmada exitosamente.',
            ventaId: venta.id
        });
    } catch (error) {
        console.error("Error al confirmar la venta:", error);
        res.status(500).json({ error: 'Error interno al confirmar la venta.' });
    }
});


// =========================================================================
// 3. ENDPOINT PARA LIBERACIÓN MANUAL FORZADA (USADO POR EL ADMIN)
// =========================================================================

router.post('/admin/release-reservation', async (req, res) => {
    const { reservaId } = req.body;

    if (!reservaId) {
        return res.status(400).json({ error: 'reservaId es requerido para liberar la reserva.' });
    }

    try {
        // 1. Liberar las butacas: marcar como disponible, limpiar campos de reserva
        const updateResult = await prisma.butaca.updateMany({
            where: { reservaId, estadoReserva: 'RESERVED' },
            data: {
                disponible: true,
                estadoReserva: null,
                reservaId: null,
                reservaHasta: null,
                compradorTemp: null,
            }
        });

        if (updateResult.count === 0) {
            return res.status(404).json({ message: 'No se encontró una reserva activa con ese ID para liberar.' });
        }

        res.status(200).json({ 
            message: `Butacas liberadas. Total: ${updateResult.count}`
        });
    } catch (error) {
        console.error("Error al liberar la reserva:", error);
        res.status(500).json({ error: 'Error interno al liberar la reserva.' });
    }
});


// =========================================================================
// 4. ENDPOINT PARA LIMPIEZA AUTOMÁTICA (Simula Cron Job - Usado por Frontend)
// =========================================================================

router.get('/cleanup-reservations', async (req, res) => {
    const now = new Date();
    try {
        // Encontrar y liberar butacas expiradas
        const expired = await prisma.butaca.updateMany({
            where: {
                estadoReserva: 'RESERVED',
                reservaHasta: { lt: now }
            },
            data: {
                disponible: true,
                estadoReserva: null,
                reservaId: null,
                reservaHasta: null,
                compradorTemp: null,
            }
        });

        // Este endpoint siempre devuelve 200 OK, incluso si no hay nada que limpiar
        res.status(200).json({ 
            message: 'Limpieza de reservas expiradas ejecutada.', 
            cleanedCount: expired.count 
        });
    } catch (error) {
        console.error("Error en el cleanup:", error);
        // Devolvemos 500 pero intentamos no romper el frontend
        res.status(500).json({ error: 'Error interno durante el proceso de limpieza.' });
    }
});


export default router;
