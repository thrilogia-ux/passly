import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  eventId: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
  htmlContent: z.string().optional().nullable(),
  cssContent: z.string().optional().nullable(),
  qrPosition: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional().nullable(),
  qrSize: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await db.invitationTemplate.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Verificar permisos
    if (template.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parsear qrPosition
    const parsedTemplate = {
      ...template,
      qrPosition: template.qrPosition ? JSON.parse(template.qrPosition) : null,
    };

    return NextResponse.json(parsedTemplate);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    // Verificar que el template existe y pertenece a la organización
    const existing = await db.invitationTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (existing.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.eventId !== undefined) updateData.eventId = data.eventId;
    if (data.backgroundImage !== undefined) updateData.backgroundImage = data.backgroundImage;
    if (data.htmlContent !== undefined) updateData.htmlContent = data.htmlContent;
    if (data.cssContent !== undefined) updateData.cssContent = data.cssContent;
    if (data.qrPosition !== undefined) {
      updateData.qrPosition = data.qrPosition ? JSON.stringify(data.qrPosition) : null;
    }
    if (data.qrSize !== undefined) updateData.qrSize = data.qrSize;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Incrementar versión si hay cambios
    if (Object.keys(updateData).length > 0) {
      updateData.version = { increment: 1 };
    }

    const template = await db.invitationTemplate.update({
      where: { id },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const parsedTemplate = {
      ...template,
      qrPosition: template.qrPosition ? JSON.parse(template.qrPosition) : null,
    };

    return NextResponse.json(parsedTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("DELETE template - Iniciando...");
    
    const session = await auth();
    console.log("DELETE template - Session:", session?.user?.id);
    
    if (!session?.user) {
      console.log("DELETE template - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("DELETE template - ID:", id);

    // Verificar que el template existe
    const template = await db.invitationTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            invitations: true,
          },
        },
      },
    });

    console.log("DELETE template - Template encontrado:", !!template);
    console.log("DELETE template - Invitaciones asociadas:", template?._count.invitations);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Verificar permisos
    if (
      session.user.role !== "SUPER_ADMIN" &&
      (!session.user.organizationId || template.organizationId !== session.user.organizationId)
    ) {
      console.log("DELETE template - Forbidden");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Si tiene invitaciones asociadas, desasociarlas primero
    if (template._count.invitations > 0) {
      console.log("DELETE template - Desasociando invitaciones...");
      await db.invitation.updateMany({
        where: { templateId: id },
        data: { templateId: null },
      });
      console.log("DELETE template - Invitaciones desasociadas");
    }

    // Eliminar físicamente el template
    console.log("DELETE template - Eliminando template...");
    await db.invitationTemplate.delete({
      where: { id },
    });
    console.log("DELETE template - Template eliminado");

    console.log("DELETE template - Éxito");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error deleting template:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
