import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// GET - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        organization: true,
        _count: {
          select: {
            organizedEvents: true,
            checkIns: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      password: undefined,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar usuario
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["CLIENT", "ORGANIZER", "STAFF", "SUPER_ADMIN"]).optional(),
  organizationId: z.string().nullable().optional(),
  password: z.string().min(6).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Si cambia el email, verificar que no exista
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "Ya existe un usuario con ese email" },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.organizationId !== undefined) updateData.organizationId = data.organizationId;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        organization: true,
      },
    });

    return NextResponse.json({
      ...user,
      password: undefined,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // No permitir eliminarse a sí mismo
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "No podés eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Usuario eliminado" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
