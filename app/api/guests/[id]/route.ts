import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GuestType } from "@prisma/client";
import { z } from "zod";

const updateGuestSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  type: z.nativeEnum(GuestType).optional(),
  tags: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        guestEvents: {
          include: {
            event: true,
            invitation: true,
            qrCode: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Error fetching guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateGuestSchema.parse(body);

    // Check for duplicate email if email is being updated
    if (data.email) {
      const existingGuest = await db.guest.findUnique({
        where: { email: data.email },
      });
      if (existingGuest && existingGuest.id !== id) {
        return NextResponse.json(
          { error: "Guest with this email already exists" },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const updatedGuest = await db.guest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating guest:", error);
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
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.guest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Guest deleted" });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}