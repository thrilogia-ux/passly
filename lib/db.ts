import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: any | undefined;
};

// Lazy-load adapter only in Node.js runtime (not Edge Runtime)
function getAdapter() {
  // Skip in Edge Runtime - detect by checking for EdgeRuntime global
  // @ts-ignore - EdgeRuntime is a global in Edge Runtime
  if (typeof EdgeRuntime !== "undefined") {
    return undefined;
  }
  
  // Check if we're in Node.js runtime (not browser)
  // Avoid using process.versions as it's not available in Edge Runtime
  try {
    // Check if we're in browser
    if (typeof window !== "undefined") {
      return undefined;
    }
    // Check if process exists (Node.js runtime)
    if (typeof process === "undefined") {
      return undefined;
    }
  } catch {
    return undefined;
  }
  
  if (!globalForPrisma.adapter) {
    try {
      // Dynamic require to avoid loading in Edge Runtime
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
      const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
      const sqlitePath = databaseUrl.replace(/^file:/, "");
      
      globalForPrisma.adapter = new PrismaBetterSqlite3({
        url: sqlitePath,
      });
    } catch (error) {
      // If adapter creation fails (e.g., in Edge Runtime), return undefined
      return undefined;
    }
  }
  
  return globalForPrisma.adapter;
}

function createPrismaClient() {
  // Only create adapter in Node.js runtime
  const adapter = getAdapter();
  
  return new PrismaClient({
    ...(adapter ? { adapter } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;