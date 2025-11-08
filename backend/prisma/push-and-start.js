import { execSync } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Obtener ruta actual
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("⏳ Ejecutando prisma db push...");

try {
  // Ejecuta el "db push" usando Prisma internamente, sin llamar binarios externos
  execSync("node --no-warnings ./node_modules/prisma/build/index.js db push", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."), // sube al directorio raíz del backend
  });
  console.log("✅ Migraciones aplicadas correctamente.");
} catch (err) {
  console.error("❌ Error ejecutando prisma db push:", err.message);
}

// Ruta del seed.js
const seedPath = path.resolve(__dirname, "seed.js");

// Ejecuta el seed automáticamente si existe
if (fs.existsSync(seedPath)) {
  console.log("🌱 Ejecutando seed.js...");
  try {
    execSync("node prisma/seed.js", { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
    console.log("✅ Seed ejecutado correctamente.");
  } catch (err) {
    console.error("⚠️ Error al ejecutar seed.js:", err.message);
  }
} else {
  console.log("⚠️ No se encontró seed.js, se omite el seed.");
}

// Finalmente, inicia el servidor
console.log("🚀 Iniciando servidor...");
import("../src/server.js");
