import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const zonesData = [
  { nombre: 'VIP', precio: 2500, color: '#f59e0b' },
  { nombre: 'Platea Baja', precio: 1800, color: '#10b981' },
  { nombre: 'Platea Alta', precio: 1200, color: '#3b82f6' },
];

// Función auxiliar para generar butacas
function generateSeats(zonaId, numRows, seatsPerRow, startRow) {
  const seats = [];
  for (let r = 0; r < numRows; r++) {
    const filaName = String.fromCharCode(65 + startRow + r); // A, B, C...
    for (let c = 1; c <= seatsPerRow; c++) {
      seats.push({
        fila: filaName,
        columna: c,
        zonaId: zonaId,
        disponible: true,
        // Los campos estadoReserva, reservaHasta y compradorTemp quedan en null por defecto
      });
    }
  }
  return seats;
}

async function main() {
  console.log('Start seeding...');

  // 1. Limpiar base de datos
  await prisma.butaca.deleteMany({});
  await prisma.venta.deleteMany({});
  await prisma.zona.deleteMany({});

  // 2. Crear Zonas
  const createdZones = await Promise.all(
    zonesData.map(data => prisma.zona.create({ data }))
  );

  const vipZone = createdZones.find(z => z.nombre === 'VIP');
  const pbZone = createdZones.find(z => z.nombre === 'Platea Baja');
  const paZone = createdZones.find(z => z.nombre === 'Platea Alta');

  // 3. Crear Butacas por Zona
  const allSeats = [
    // VIP (Filas A-D)
    ...generateSeats(vipZone.id, 4, 10, 0),
    // Platea Baja (Filas E-J)
    ...generateSeats(pbZone.id, 6, 15, 4),
    // Platea Alta (Filas K-O)
    ...generateSeats(paZone.id, 5, 20, 10),
  ];

  await prisma.butaca.createMany({
    data: allSeats,
  });

  console.log('Seeding finished.');
  console.log(`Creadas ${allSeats.length} butacas.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
