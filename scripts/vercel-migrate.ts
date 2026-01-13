#!/usr/bin/env tsx
// Script para ejecutar migraciones en Vercel
import { execSync } from "child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL environment variable is not set");
  console.error("Please ensure DATABASE_URL is set in Vercel environment variables");
  process.exit(1);
}

console.log("✅ DATABASE_URL found");
console.log("🔄 Running Prisma migrations...");

try {
  // En Prisma 7, migrate deploy lee DATABASE_URL de las variables de entorno
  // y también puede leer prisma.config.ts si está disponible
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("✅ Migrations completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
