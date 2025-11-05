/*
  Warnings:

  - You are about to alter the column `fila` on the `Butaca` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Butaca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fila" INTEGER NOT NULL,
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
INSERT INTO "new_Butaca" ("columna", "compradorTemp", "disponible", "estadoReserva", "fila", "id", "reservaHasta", "reservaId", "ventaId", "zonaId") SELECT "columna", "compradorTemp", "disponible", "estadoReserva", "fila", "id", "reservaHasta", "reservaId", "ventaId", "zonaId" FROM "Butaca";
DROP TABLE "Butaca";
ALTER TABLE "new_Butaca" RENAME TO "Butaca";
CREATE UNIQUE INDEX "Butaca_fila_columna_key" ON "Butaca"("fila", "columna");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
