/*
  Warnings:

  - Added the required column `color` to the `Zona` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Zona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "color" TEXT NOT NULL
);
INSERT INTO "new_Zona" ("id", "nombre", "precio") SELECT "id", "nombre", "precio" FROM "Zona";
DROP TABLE "Zona";
ALTER TABLE "new_Zona" RENAME TO "Zona";
CREATE UNIQUE INDEX "Zona_nombre_key" ON "Zona"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
