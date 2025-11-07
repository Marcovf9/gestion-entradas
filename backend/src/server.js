import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

async function expirarReservasVencidas() {
  const ahora = new Date();

  try {
    await prisma.butaca.updateMany({
      where: {
        estado: "RESERVADA",
        reservaHasta: {
          lt: ahora,
        },
      },
      data: {
        estado: "DISPONIBLE",
        clienteNombre: null,
        clienteDni: null,
        clienteEmail: null,
        reservaHasta: null,
      },
    });
  } catch (err) {
    console.error("Error expirando reservas vencidas", err);
  }
}


// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Get all zones
app.get("/api/zones", async (req, res) => {
  try {
    const zonas = await prisma.zona.findMany({
      orderBy: { id: "asc" }
    });
    res.json(zonas);
  } catch (err) {
    console.error("Error /api/zones", err);
    res.status(500).json({ error: "Error obteniendo zonas" });
  }
});

// Get all seats
app.get("/api/seats", async (req, res) => {
  try {
    // Limpia reservas vencidas antes de responder
    await expirarReservasVencidas();

    const butacas = await prisma.butaca.findMany({
      orderBy: [{ zonaId: "asc" }, { fila: "asc" }, { columna: "asc" }]
    });
    res.json(butacas);
  } catch (err) {
    console.error("Error /api/seats", err);
    res.status(500).json({ error: "Error obteniendo butacas" });
  }
});

// Simple toggle selection (for demo only, not real payments)
app.post("/api/seats/:id/toggle", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const seat = await prisma.butaca.findUnique({ where: { id } });
    if (!seat) return res.status(404).json({ error: "Butaca no encontrada" });

    const next =
      seat.estado === "DISPONIBLE"
        ? "RESERVADA"
        : seat.estado === "RESERVADA"
        ? "DISPONIBLE"
        : "VENDIDA";

    const updated = await prisma.butaca.update({
      where: { id },
      data: { estado: next }
    });

    res.json(updated);
  } catch (err) {
    console.error("Error /api/seats/:id/toggle", err);
    res.status(500).json({ error: "No se pudo actualizar la butaca" });
  }
});

app.post("/api/reservas", async (req, res) => {
  const { seatIds, nombre, dni, email } = req.body;

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: "No se enviaron butacas a reservar" });
  }
  if (!nombre || !dni || !email) {
    return res
      .status(400)
      .json({ error: "Nombre, DNI y email son obligatorios" });
  }

  const ahora = new Date();
  const vence = new Date(ahora.getTime() + 30 * 60 * 1000); // 30 minutos

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // Traemos las butacas
      const butacas = await tx.butaca.findMany({
        where: { id: { in: seatIds } },
      });

      if (butacas.length !== seatIds.length) {
        throw new Error("Alguna de las butacas no existe");
      }

      // Verificamos que todas estén DISPO
      const noDisponibles = butacas.filter((b) => b.estado !== "DISPONIBLE");
      if (noDisponibles.length > 0) {
        const ids = noDisponibles.map((b) => b.id);
        return {
          ok: false,
          conflict: ids,
        };
      }

      await tx.butaca.updateMany({
        where: { id: { in: seatIds } },
        data: {
          estado: "RESERVADA",
          clienteNombre: nombre,
          clienteDni: dni,
          clienteEmail: email,
          reservaHasta: vence,
        },
      });

      const actualizadas = await tx.butaca.findMany({
        where: { id: { in: seatIds } },
      });

      return {
        ok: true,
        seats: actualizadas,
        expiresAt: vence,
      };
    });

    if (!resultado.ok) {
      return res.status(409).json({
        error:
          "Alguna de las butacas ya no está disponible. Volvé a cargar el mapa.",
        conflictSeatIds: resultado.conflict,
      });
    }

    res.json(resultado);
  } catch (err) {
    console.error("Error /api/reservas", err);
    res.status(500).json({ error: "No se pudo generar la reserva" });
  }
});

app.get("/api/reservas/activas", async (req, res) => {
  try {
    await expirarReservasVencidas();

    const ahora = new Date();

    const reservas = await prisma.butaca.findMany({
      where: {
        estado: "RESERVADA",
        reservaHasta: { gt: ahora },
      },
      include: {
        zona: true,
      },
      orderBy: [{ zonaId: "asc" }, { fila: "asc" }, { columna: "asc" }],
    });

    res.json(reservas);
  } catch (err) {
    console.error("Error /api/reservas/activas", err);
    res.status(500).json({ error: "Error obteniendo reservas activas" });
  }
});

app.post("/api/reservas/:seatId/confirmar", async (req, res) => {
  const seatId = Number(req.params.seatId);

  try {
    const seat = await prisma.butaca.findUnique({ where: { id: seatId } });
    if (!seat) {
      return res.status(404).json({ error: "Butaca no encontrada" });
    }
    if (seat.estado !== "RESERVADA") {
      return res
        .status(400)
        .json({ error: "La butaca no está en estado RESERVADA" });
    }

    const updated = await prisma.butaca.update({
      where: { id: seatId },
      data: {
        estado: "VENDIDA",
        reservaHasta: null,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error /api/reservas/:seatId/confirmar", err);
    res
      .status(500)
      .json({ error: "No se pudo marcar la butaca como pagada" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
