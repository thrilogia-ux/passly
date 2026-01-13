import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { InvitationStatus } from "@prisma/client";
import { z } from "zod";
import { generateConfirmationToken } from "@/lib/invitations/tokens";

const createInvitationSchema = z.object({
  guestEventId: z.string(),
  templateId: z.string().optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status") as InvitationStatus | null;

    const where: any = {};
    if (eventId) {
      where.eventId = eventId;
    }
    if (status) {
      where.status = status;
    }

    const invitations = await db.invitation.findMany({
      where,
      include: {
        guestEvent: {
          include: {
            guest: true,
            event: true,
          },
        },
        template: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
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
    const data = createInvitationSchema.parse(body);

    const guestEvent = await db.guestEvent.findUnique({
      where: { id: data.guestEventId },
      include: {
        guest: true,
        event: true,
      },
    });

    if (!guestEvent) {
      return NextResponse.json({ error: "Guest event not found" }, { status: 404 });
    }

    // Check if invitation already exists
    const existing = await db.invitation.findUnique({
      where: { guestEventId: data.guestEventId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Invitation already exists", invitation: existing },
        { status: 409 }
      );
    }

    // If no template specified, try to find event's default template
    let templateId = data.templateId;
    if (!templateId && guestEvent.event) {
      const eventTemplate = await db.invitationTemplate.findFirst({
        where: {
          eventId: guestEvent.eventId,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });
      if (eventTemplate) {
        templateId = eventTemplate.id;
      } else {
        // Try to find global template for organization
        const eventWithOrg = await db.event.findUnique({
          where: { id: guestEvent.eventId },
          select: { organizationId: true },
        });
        if (eventWithOrg) {
          const globalTemplate = await db.invitationTemplate.findFirst({
            where: {
              organizationId: eventWithOrg.organizationId,
              eventId: null,
              isActive: true,
            },
            orderBy: { createdAt: "desc" },
          });
          if (globalTemplate) {
            templateId = globalTemplate.id;
          }
        }
      }
    }

    const invitation = await db.invitation.create({
      data: {
        guestEventId: data.guestEventId,
        eventId: guestEvent.eventId,
        templateId: templateId || null,
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
        status: InvitationStatus.PENDING,
        confirmationToken: generateConfirmationToken(), // Generate unique token for RSVP
      },
      include: {
        guestEvent: {
          include: {
            guest: true,
            event: true,
          },
        },
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}