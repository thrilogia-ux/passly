import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(1),
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
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    const template = await db.invitationTemplate.create({
      data: {
        name: data.name,
        organizationId: session.user.organizationId,
        eventId: data.eventId || null,
        backgroundImage: data.backgroundImage || null,
        htmlContent: data.htmlContent || null,
        cssContent: data.cssContent || null,
        qrPosition: data.qrPosition ? JSON.stringify(data.qrPosition) : null,
        qrSize: data.qrSize || 200,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");

    const where: any = {
      organizationId: session.user.organizationId,
      isActive: true,
    };

    // Si se especifica eventId, traer templates del evento o globales
    if (eventId) {
      where.OR = [
        { eventId: eventId },
        { eventId: null }, // Templates globales
      ];
    } else {
      where.eventId = null; // Solo templates globales si no se especifica evento
    }

    const templates = await db.invitationTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Parsear qrPosition de JSON string a objeto
    const parsedTemplates = templates.map((template) => ({
      ...template,
      qrPosition: template.qrPosition ? JSON.parse(template.qrPosition) : null,
    }));

    return NextResponse.json(parsedTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
