import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getConnectionUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  // Limitar conexiones por instancia para evitar agotar pool (Supabase, Vercel serverless)
  const separator = url.includes("?") ? "&" : "?";
  if (url.includes("connection_limit=")) return url;
  return `${url}${separator}connection_limit=5`;
}

function createPrismaClient() {
  const url = getConnectionUrl();
  if (!url) {
    console.error("DATABASE_URL is not set!");
  }
  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Reusar instancia en dev; en producción Vercel reutiliza por función
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;