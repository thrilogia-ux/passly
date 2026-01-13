// Script para verificar que el servidor puede iniciar
import { db } from "../lib/db";
import { auth } from "../lib/auth";

async function check() {
  console.log("🔍 Verificando configuración...");
  
  // Verificar variables de entorno
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ NO CONFIGURADO");
  console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Configurado" : "❌ NO CONFIGURADO");
  console.log("DATABASE_URL:", process.env.DATABASE_URL || "❌ NO CONFIGURADO");
  
  // Verificar base de datos
  try {
    await db.$connect();
    console.log("✅ Base de datos conectada");
    await db.$disconnect();
  } catch (error: any) {
    console.error("❌ Error de base de datos:", error.message);
  }
  
  // Verificar auth (solo en contexto de request)
  console.log("✅ Verificaciones completadas");
}

check();
