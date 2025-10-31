import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Duración de la reserva temporal en minutos (ej: 30 minutos)
const RESERVATION_DURATION_MINUTES = 30;

// POST /api/reserve
export const createReservation = async (req, res) => {
  const { butacaIds, compradorNombre, compradorEmail } = req.body;

  if (!butacaIds || !Array.isArray(butacaIds) || butacaIds.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos una butaca.' });
  }

  if (!compradorNombre || !compradorEmail) {
    return res.status(400).json({ error: 'Debe ingresar nombre y email del comprador.' });
  }

  // 1. Verificar disponibilidad y reservar
  try {
    const seatsToReserve = await prisma.butaca.findMany({
      where: {
        id: { in: butacaIds },
        disponible: true,
        estadoReserva: null, // Solo si no está ya reservada temporalmente
      },
      select: { id: true, fila: true, columna: true, zonaId: true },
    });

    if (seatsToReserve.length !== butacaIds.length) {
      const unavailableIds = butacaIds.filter(id => !seatsToReserve.some(s => s.id === id));
      return res.status(409).json({ 
        error: 'Conflicto de reserva', 
        message: 'Algunas butacas ya están reservadas o vendidas. Por favor, actualice y vuelva a intentar.',
        unavailableIds
      });
    }

    const reservationId = randomUUID();
    const expiryDate = new Date(Date.now() + RESERVATION_DURATION_MINUTES * 60000);

    // 2. Transacción para marcar las butacas como RESERVADAS
    await prisma.$transaction(async (tx) => {
      await tx.butaca.updateMany({
        where: { id: { in: butacaIds } },
        data: {
          estadoReserva: 'RESERVED',
          reservaHasta: expiryDate,
          reservaId: reservationId,
          compradorTemp: JSON.stringify({ nombre: compradorNombre, email: compradorEmail })
        },
      });
    });

    res.status(200).json({ 
      message: `Butacas reservadas por ${RESERVATION_DURATION_MINUTES} minutos.`,
      reservaId,
      reservaHasta: expiryDate.toISOString()
    });

  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar la reserva.' });
  }
};


// POST /api/admin/confirm-purchase
// ESTE ENDPOINT SOLO DEBE SER USADO POR EL ADMINISTRADOR MANUALMENTE
export const confirmPurchase = async (req, res) => {
  const { reservaId } = req.body;

  if (!reservaId) {
    return res.status(400).json({ error: 'Se requiere un ID de reserva para confirmar la compra.' });
  }

  try {
    const seatsToConfirm = await prisma.butaca.findMany({
      where: { 
        reservaId, 
        estadoReserva: 'RESERVED',
        disponible: true // Aseguramos que la butaca no fue vendida por otro proceso
      },
      select: { id: true, compradorTemp: true, zonaId: true, fila: true, columna: true }
    });

    if (seatsToConfirm.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada, expirada o ya vendida.' });
    }
    
    // Asumimos que todos tienen el mismo compradorTemp
    const { nombre, email } = JSON.parse(seatsToConfirm[0].compradorTemp);
    const butacaIds = seatsToConfirm.map(s => s.id);
    
    // 1. Crear el registro de Venta
    const venta = await prisma.venta.create({
      data: {
        compradorNombre: nombre,
        compradorEmail: email,
      },
    });

    // 2. Transacción para marcar como vendida
    await prisma.$transaction(async (tx) => {
      await tx.butaca.updateMany({
        where: { id: { in: butacaIds } },
        data: {
          disponible: false, // Ahora está vendida
          ventaId: venta.id,
          estadoReserva: null, // Limpiar campos temporales
          reservaHasta: null,
          reservaId: null,
          compradorTemp: null
        },
      });
    });

    res.status(200).json({ 
      message: `Venta confirmada y ${seatsToConfirm.length} butacas marcadas como ocupadas.`,
      ventaId: venta.id,
      butacasVendidas: butacaIds
    });

  } catch (error) {
    console.error('Error al confirmar la compra:', error);
    res.status(500).json({ error: 'Error interno del servidor al confirmar la compra.' });
  }
};


// GET /api/cleanup-reservations
// Script de limpieza (simulación de Cron Job)
export const cleanupReservations = async (req, res) => {
  const now = new Date();
  
  try {
    const result = await prisma.butaca.updateMany({
      where: {
        estadoReserva: 'RESERVED',
        reservaHasta: { lt: now }, // Donde la fecha de expiración es anterior a ahora
      },
      data: {
        estadoReserva: null, // Liberar la butaca
        reservaHasta: null,
        reservaId: null,
        compradorTemp: null
      },
    });

    res.status(200).json({ 
      message: `Proceso de limpieza completado. ${result.count} reservas expiradas fueron liberadas.`,
      count: result.count
    });
  } catch (error) {
    console.error('Error en el proceso de limpieza:', error);
    res.status(500).json({ error: 'Error al ejecutar la limpieza de reservas.' });
  }
};