import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/zones', async (req, res) => {
    try {
        const zones = await prisma.zona.findMany();
        res.json(zones);
    } catch (error) {
        console.error("Error fetching zones:", error);
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
});

// ¡CAMBIO CLAVE: Exportación por defecto!
export default router;
