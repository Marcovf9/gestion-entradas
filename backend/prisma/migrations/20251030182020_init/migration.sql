-- CreateTable
CREATE TABLE "Zona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Butaca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zonaId" INTEGER NOT NULL,
    "fila" INTEGER NOT NULL,
    "columna" INTEGER NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Butaca_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compradorNombre" TEXT NOT NULL,
    "compradorEmail" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VentasButacas" (
    "ventaId" INTEGER NOT NULL,
    "butacaId" INTEGER NOT NULL,

    PRIMARY KEY ("ventaId", "butacaId"),
    CONSTRAINT "VentasButacas_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VentasButacas_butacaId_fkey" FOREIGN KEY ("butacaId") REFERENCES "Butaca" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
