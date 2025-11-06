import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de zonas y butacas...");

  // Limpieza básica (por si no es reset total)
  try {
    await prisma.butaca.deleteMany();
    await prisma.zona.deleteMany();
  } catch (err) {
    console.warn("⚠️ Error limpiando datos anteriores (puede ser normal en la primera vez)", err.message);
  }

  // Definición de zonas (cada bloque físico es una zona independiente)
  const zonasData = [
    { nombre: "Platea baja", precio: 25000, color: "#f5d742" },            // id 1
    { nombre: "Platea superior central", precio: 20000, color: "#4caf50" },// id 2
    { nombre: "Palcos inferiores A", precio: 25000, color: "#ff7043" },    // id 3
    { nombre: "Palcos inferiores B", precio: 25000, color: "#ff7043" },    // id 4
    { nombre: "Palcos VIP A", precio: 20000, color: "#ab47bc" },           // id 5
    { nombre: "Palcos VIP B", precio: 20000, color: "#ab47bc" },           // id 6
    { nombre: "Palcos superiores A", precio: 20000, color: "#42a5f5" },    // id 7
    { nombre: "Palcos superiores B", precio: 20000, color: "#42a5f5" },    // id 8
    { nombre: "Palco superior central", precio: 20000, color: "#26c6da" }  // id 9
  ];

  await prisma.zona.createMany({ data: zonasData });
  const zonas = await prisma.zona.findMany();
  const byName = Object.fromEntries(zonas.map(z => [z.nombre, z.id]));

  const butacas = [];

  // Helper para crear filas consecutivas
  function addZoneRows(zonaNombre, seatsPerRow) {
    const zonaId = byName[zonaNombre];
    seatsPerRow.forEach((count, filaIndex) => {
      const fila = filaIndex + 1;
      for (let c = 1; c <= count; c++) {
        butacas.push({
          fila,
          columna: c,
          zonaId,
          estado: "DISPONIBLE"
        });
      }
    });
  }

  // ---- Distribuciones según tu especificación ----

  // Platea baja: 13 filas, 14 columnas, excepto fila 13 con 12
  const plateaBajaRows = Array(12).fill(14);
  plateaBajaRows.push(12);
  addZoneRows("Platea baja", plateaBajaRows);

  // Platea superior central
  addZoneRows("Platea superior central", [26, 28, 31, 25, 28, 30]);

  // Palcos inferiores (A y B) - por lado: [2,3,4,5,5,2]
  const palcosInferioresRows = [2, 3, 4, 5, 5, 2];
  addZoneRows("Palcos inferiores A", palcosInferioresRows);
  addZoneRows("Palcos inferiores B", palcosInferioresRows);

  // Palcos VIP (A y B)
  // Fila 3: 3 butacas + pasillo + 2 butacas (total 5)
  // Fila 4: 3 butacas + pasillo + 3 butacas (total 6)
  const palcosVIPRows = [3, 3, 5, 6, 3, 2];
  addZoneRows("Palcos VIP A", palcosVIPRows);
  addZoneRows("Palcos VIP B", palcosVIPRows);

  // Palcos superiores (A y B)
  // Fila1: 4 + pasillo + 3 (7), fila2: 7, fila3:4
  const palcosSuperioresRows = [7, 7, 4];
  addZoneRows("Palcos superiores A", palcosSuperioresRows);
  addZoneRows("Palcos superiores B", palcosSuperioresRows);

  // Palco superior central - 30 butacas en una fila
  addZoneRows("Palco superior central", [30]);

  // Crear butacas
  await prisma.butaca.createMany({ data: butacas });

  const totalButacas = await prisma.butaca.count();
  console.log(`✅ Zonas creadas: ${zonas.length}`);
  console.log(`✅ Butacas creadas: ${totalButacas}`);
  console.log("🌱 Seed completado con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
