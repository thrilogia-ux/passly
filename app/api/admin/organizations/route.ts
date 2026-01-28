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

// GET - Listar todas las organizaciones
export async function GET(request: NextRequest) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const organizations = await db.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            events: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(organizations);
  } catch (error: any) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crear organización
const createOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  tokenPlan: z.string().optional(),
  tokenBalance: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createOrgSchema.parse(body);

    // Verificar si el slug ya existe
    const existingOrg = await db.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Ya existe una organización con ese slug" },
        { status: 400 }
      );
    }

    const organization = await db.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        tokenPlan: data.tokenPlan || "FREE",
        tokenBalance: data.tokenBalance || 10, // 10 tokens gratis por defecto
      },
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating organization:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
