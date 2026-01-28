import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Solo SUPER_ADMIN puede acceder
async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// GET - Listar todos los usuarios
export async function GET(request: NextRequest) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const organizationId = searchParams.get("organizationId");
    const search = searchParams.get("search");

    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await db.user.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            tokenBalance: true,
          },
        },
        _count: {
          select: {
            organizedEvents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // No devolver passwords
    const safeUsers = users.map((user) => ({
      ...user,
      password: undefined,
    }));

    return NextResponse.json(safeUsers);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crear usuario
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "El nombre es obligatorio"),
  role: z.enum(["CLIENT", "ORGANIZER", "STAFF"]),
  organizationId: z.string().nullish().transform(val => val || undefined),
});

export async function POST(request: NextRequest) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log("Received body:", body); // Debug
    
    const data = createUserSchema.parse(body);
    console.log("Parsed data:", data); // Debug

    // Verificar si el email ya existe
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: data.role,
        organizationId: data.organizationId || null,
      },
      include: {
        organization: true,
      },
    });

    console.log("User created:", user.id); // Debug

    return NextResponse.json({
      ...user,
      password: undefined,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(i => i.message).join(", ");
      return NextResponse.json(
        { error: messages, details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
