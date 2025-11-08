import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("⏳ Ejecutando prisma db push antes de iniciar el servidor...");

try {
  execSync("npx prisma db push", { stdio: "inherit", cwd: __dirname + "/.." });
  console.log("✅ Migraciones aplicadas correctamente.");
} catch (err) {
  console.error("❌ Error ejecutando prisma db push:", err.message);
}

import("../src/server.js");
