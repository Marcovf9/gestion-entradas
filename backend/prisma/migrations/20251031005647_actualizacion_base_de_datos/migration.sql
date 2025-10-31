/*
  Warnings:

  - You are about to drop the `VentasButacas` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Venta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Venta` table. All the data in the column will be lost.
  - You are about to alter the column `precio` on the `Zona` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VentasButacas";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Butaca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fila" TEXT NOT NULL,
    "columna" INTEGER NOT NULL,
    "zonaId" INTEGER NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "estadoReserva" TEXT,
    "reservaHasta" DATETIME,
    "reservaId" TEXT,
    "compradorTemp" TEXT,
    "ventaId" TEXT,
    CONSTRAINT "Butaca_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Butaca_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Butaca" ("columna", "disponible", "fila", "id", "zonaId") SELECT "columna", "disponible", "fila", "id", "zonaId" FROM "Butaca";
DROP TABLE "Butaca";
ALTER TABLE "new_Butaca" RENAME TO "Butaca";
CREATE UNIQUE INDEX "Butaca_fila_columna_key" ON "Butaca"("fila", "columna");
CREATE TABLE "new_Venta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "compradorNombre" TEXT NOT NULL,
    "compradorEmail" TEXT NOT NULL,
    "fechaVenta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Venta" ("compradorEmail", "compradorNombre", "id") SELECT "compradorEmail", "compradorNombre", "id" FROM "Venta";
DROP TABLE "Venta";
ALTER TABLE "new_Venta" RENAME TO "Venta";
CREATE TABLE "new_Zona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL
);
INSERT INTO "new_Zona" ("id", "nombre", "precio") SELECT "id", "nombre", "precio" FROM "Zona";
DROP TABLE "Zona";
ALTER TABLE "new_Zona" RENAME TO "Zona";
CREATE UNIQUE INDEX "Zona_nombre_key" ON "Zona"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
