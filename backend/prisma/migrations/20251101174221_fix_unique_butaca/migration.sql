/*
  Warnings:

  - A unique constraint covering the columns `[fila,columna,zonaId]` on the table `Butaca` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Butaca_fila_columna_key";

-- CreateIndex
CREATE UNIQUE INDEX "Butaca_fila_columna_zonaId_key" ON "Butaca"("fila", "columna", "zonaId");
