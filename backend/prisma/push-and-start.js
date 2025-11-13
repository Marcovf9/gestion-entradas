import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("⏳ Ejecutando prisma db push...");

try {
  execSync("node --no-warnings ./node_modules/prisma/build/index.js db push", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });
  console.log("✅ Migraciones aplicadas correctamente.");
} catch (err) {
  console.error("❌ Error ejecutando prisma db push:", err.message);
}

// ⛔ IMPORTANTE: NO ejecutar seed automáticamente
console.log("🌱 Seed deshabilitado para evitar perder datos existentes.");

// 🚀 Iniciar servidor
console.log("🚀 Iniciando servidor...");
import("../src/server.js");
