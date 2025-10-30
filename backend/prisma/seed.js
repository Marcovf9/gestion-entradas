import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

function range(n) { return Array.from({length:n}, (_,i)=>i+1); }

async function main() {
  await prisma.ventasButacas.deleteMany({});
  await prisma.venta.deleteMany({});
  await prisma.butaca.deleteMany({});
  await prisma.zona.deleteMany({});

  const config = JSON.parse(fs.readFileSync(new URL('../config/zones.json', import.meta.url)));
  for (const block of config.blocks) {
    const zona = await prisma.zona.create({ data: { nombre: block.nombre, precio: block.precio } });
    const layout = block.layout || { type: 'grid', filas: 1, columnas: 1 };

    if (layout.type === 'grid') {
      const filas = layout.filas;
      for (const fila of range(filas)) {
        const columnas = (layout.ultimaFilaColumnas && fila === filas)
          ? layout.ultimaFilaColumnas
          : layout.columnas;
        for (const col of range(columnas)) {
          await prisma.butaca.create({ data: { zonaId: zona.id, fila, columna: col } });
        }
      }
    } else if (layout.type === 'perRow') {
      const rows = layout.rows;
      for (let i=0;i<rows.length;i++) {
        const fila = i+1;
        const row = rows[i];
        const count = typeof row === 'number' ? row : (row.count || 0);
        for (const col of range(count)) {
          await prisma.butaca.create({ data: { zonaId: zona.id, fila, columna: col } });
        }
      }
    } else {
      await prisma.butaca.create({ data: { zonaId: zona.id, fila: 1, columna: 1 } });
    }
    console.log(`Seeded zona ${block.nombre}`);
  }
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
