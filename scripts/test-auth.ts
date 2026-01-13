import { auth } from "../lib/auth";

async function testAuth() {
  try {
    console.log("🧪 Probando auth()...");
    console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Configurado" : "❌ No configurado");
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "No configurado");
    
    const session = await auth();
    console.log("✅ auth() ejecutado exitosamente");
    console.log("Session:", session ? "Existe" : "No existe");
    if (session?.user) {
      console.log("User:", session.user.email);
    }
  } catch (error: any) {
    console.error("❌ Error en auth():", error.message);
    console.error("❌ Stack:", error.stack);
  }
}

testAuth();
