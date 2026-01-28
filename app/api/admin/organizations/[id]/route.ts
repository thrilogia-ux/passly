import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// GET - Obtener organización por ID
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
    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            events: true,
            templates: true,
          },
        },
        tokenTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar organización
const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  tokenPlan: z.string().optional(),
  logo: z.string().nullable().optional(),
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
    const data = updateOrgSchema.parse(body);

    const existingOrg = await db.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // Si cambia el slug, verificar que no exista
    if (data.slug && data.slug !== existingOrg.slug) {
      const slugExists = await db.organization.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Ya existe una organización con ese slug" },
          { status: 400 }
        );
      }
    }

    const organization = await db.organization.update({
      where: { id },
      data,
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating organization:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar organización
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
    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            events: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // Advertir si tiene usuarios o eventos
    if (organization._count.users > 0 || organization._count.events > 0) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar una organización con usuarios o eventos. Primero eliminá o reasigná los recursos.",
          users: organization._count.users,
          events: organization._count.events,
        },
        { status: 400 }
      );
    }

    await db.organization.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Organización eliminada" });
  } catch (error: any) {
    console.error("Error deleting organization:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
