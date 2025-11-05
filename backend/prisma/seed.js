import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de zonas y butacas...");

  // Limpieza segura de tablas
  try { await prisma.reserva.deleteMany(); } catch { console.warn("⚠️ No se pudo limpiar tabla 'reserva'"); }
  try { await prisma.venta.deleteMany(); } catch { console.warn("⚠️ No se pudo limpiar tabla 'venta'"); }
  try { await prisma.butaca.deleteMany(); } catch { console.warn("⚠️ No se pudo limpiar tabla 'butaca'"); }
  try { await prisma.zona.deleteMany(); } catch { console.warn("⚠️ No se pudo limpiar tabla 'zona'"); }

  // --- ZONAS ---
  const zonasData = [
    { nombre: "Platea baja", precio: 25000, color: "#f5d742" },
    { nombre: "Platea superior central", precio: 20000, color: "#4caf50" },
    { nombre: "Palcos inferiores A", precio: 25000, color: "#ff7043" },
    { nombre: "Palcos inferiores B", precio: 25000, color: "#ff7043" },
    { nombre: "Palcos VIP A", precio: 20000, color: "#ab47bc" },
    { nombre: "Palcos VIP B", precio: 20000, color: "#ab47bc" },
    { nombre: "Palcos superiores A", precio: 20000, color: "#42a5f5" },
    { nombre: "Palcos superiores B", precio: 20000, color: "#42a5f5" },
    { nombre: "Palco superior central", precio: 20000, color: "#26c6da" },
  ];

  const zonas = await prisma.$transaction(
    zonasData.map((z) => prisma.zona.create({ data: z }))
  );

  const butacasData = [];

  // 1️⃣ Platea baja - 13 filas, 14 columnas (última 12)
  {
    const zona = zonas.find((z) => z.nombre === "Platea baja");
    for (let fila = 1; fila <= 13; fila++) {
      const columnas = fila === 13 ? 12 : 14;
      for (let columna = 1; columna <= columnas; columna++) {
        butacasData.push({ fila, columna, zonaId: zona.id, disponible: true });
      }
    }
  }

  // 2️⃣ Platea superior central - [26, 28, 31, 25, 28, 30]
  {
    const zona = zonas.find((z) => z.nombre === "Platea superior central");
    const distribucion = [26, 28, 31, 25, 28, 30];
    distribucion.forEach((colCount, fila) => {
      for (let columna = 1; columna <= colCount; columna++) {
        butacasData.push({
          fila: fila + 1,
          columna,
          zonaId: zona.id,
          disponible: true,
        });
      }
    });
  }

  // 3️⃣ Palcos inferiores A y B - [2,3,4,5,5,2]
  {
    const distribucion = [2, 3, 4, 5, 5, 2];
    for (const nombre of ["Palcos inferiores A", "Palcos inferiores B"]) {
      const zona = zonas.find((z) => z.nombre === nombre);
      distribucion.forEach((colCount, fila) => {
        for (let columna = 1; columna <= colCount; columna++) {
          butacasData.push({
            fila: fila + 1,
            columna,
            zonaId: zona.id,
            disponible: true,
          });
        }
      });
    }
  }

  // 4️⃣ Palcos VIP A y B - [3,3,5,6,3,2]
  {
    const distribucion = [3, 3, 5, 6, 3, 2];
    for (const nombre of ["Palcos VIP A", "Palcos VIP B"]) {
      const zona = zonas.find((z) => z.nombre === nombre);
      distribucion.forEach((colCount, fila) => {
        for (let columna = 1; columna <= colCount; columna++) {
          butacasData.push({
            fila: fila + 1,
            columna,
            zonaId: zona.id,
            disponible: true,
          });
        }
      });
    }
  }

  // 5️⃣ Palcos superiores A y B - [7,7,4]
  {
    const distribucion = [7, 7, 4];
    for (const nombre of ["Palcos superiores A", "Palcos superiores B"]) {
      const zona = zonas.find((z) => z.nombre === nombre);
      distribucion.forEach((colCount, fila) => {
        for (let columna = 1; columna <= colCount; columna++) {
          butacasData.push({
            fila: fila + 1,
            columna,
            zonaId: zona.id,
            disponible: true,
          });
        }
      });
    }
  }

  // 6️⃣ Palco superior central - 1 fila, 30 butacas
  {
    const zona = zonas.find((z) => z.nombre === "Palco superior central");
    for (let columna = 1; columna <= 30; columna++) {
      butacasData.push({
        fila: 1,
        columna,
        zonaId: zona.id,
        disponible: true,
      });
    }
  }

  // Inserta todas las butacas
  await prisma.butaca.createMany({ data: butacasData });

  console.log(`✅ Zonas creadas: ${zonas.length}`);
  console.log(`✅ Butacas creadas: ${butacasData.length}`);
  console.log("🌱 Seed completado con éxito!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
