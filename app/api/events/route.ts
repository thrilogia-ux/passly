import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus } from "@prisma/client";
import { z } from "zod";

const createEventSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional(),
  organizationId: z.string(),
  organizerId: z.string().optional(),
  allowReentry: z.boolean().default(true),
  maxReentries: z.number().default(1),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status") as EventStatus | null;

    const where: any = {};
    
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    if (status) {
      where.status = status;
    }

    // Filter by user role
    if (session.user.role !== "SUPER_ADMIN") {
      if (session.user.organizationId) {
        where.organizationId = session.user.organizationId;
      } else {
        return NextResponse.json({ error: "No organization assigned" }, { status: 403 });
      }
    }

    const events = await db.event.findMany({
      where,
      include: {
        organization: true,
        organizer: true,
        _count: {
          select: {
            guestEvents: true,
            checkIns: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Get organizationId from session or create default for SUPER_ADMIN
    let organizationId: string | undefined = session.user.organizationId || undefined;
    
    if (session.user.role === "SUPER_ADMIN") {
      // For SUPER_ADMIN, try to get from body or create a default organization
      if (body.organizationId) {
        organizationId = body.organizationId;
      } else {
        // Create or get default organization for SUPER_ADMIN
        let defaultOrg = await db.organization.findFirst({
          where: { slug: "default" },
        });
        
        if (!defaultOrg) {
          defaultOrg = await db.organization.create({
            data: {
              name: "Default Organization",
              slug: "default",
            },
          });
        }
        
        organizationId = defaultOrg.id;
      }
    } else {
      if (!organizationId) {
        return NextResponse.json({ error: "No organization assigned to user" }, { status: 403 });
      }
    }

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // Convert datetime-local format to ISO string
    let dateValue = body.date;
    if (dateValue) {
      // datetime-local format is YYYY-MM-DDTHH:mm, convert to ISO
      if (dateValue.includes('T') && !dateValue.includes('Z') && !dateValue.includes('+')) {
        // It's in datetime-local format, convert to ISO
        dateValue = new Date(dateValue).toISOString();
      }
    } else {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Prepare data for validation (make organizationId optional in schema validation)
    const dataToValidate = {
      name: body.name,
      description: body.description,
      date: dateValue,
      location: body.location,
      organizationId: organizationId,
      organizerId: body.organizerId || session.user.id,
      allowReentry: body.allowReentry ?? true,
      maxReentries: body.maxReentries ?? 1,
      validFrom: body.validFrom,
      validUntil: body.validUntil,
    };

    const data = createEventSchema.parse(dataToValidate);

    const event = await db.event.create({
      data: {
        name: data.name,
        description: data.description || null,
        date: new Date(data.date),
        location: data.location || null,
        status: (body.status as EventStatus) || "DRAFT",
        organizationId: organizationId,
        organizerId: data.organizerId || session.user.id,
        allowReentry: data.allowReentry ?? true,
        maxReentries: data.maxReentries ?? 1,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
      include: {
        organization: true,
        organizer: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}