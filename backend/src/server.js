import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
