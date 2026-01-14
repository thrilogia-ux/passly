import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, accountType } = body;

    // Validations
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (accountType !== "CLIENT" && accountType !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Tipo de cuenta inválido" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate organization slug from name
    const orgSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists, if so append random number
    let finalSlug = orgSlug;
    let slugExists = await db.organization.findUnique({
      where: { slug: finalSlug },
    });

    if (slugExists) {
      finalSlug = `${orgSlug}-${Math.floor(Math.random() * 10000)}`;
    }

    // Create organization and user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          tokenBalance: 10, // 10 free invitations
          tokenPlan: "FREE",
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: accountType === "ORGANIZER" ? "ORGANIZER" : "CLIENT",
          organizationId: organization.id,
        },
      });

      // Create initial token transaction (bonus)
      await tx.tokenTransaction.create({
        data: {
          organizationId: organization.id,
          type: "BONUS",
          amount: 10,
          description: "Welcome bonus - 10 free invitations",
          metadata: JSON.stringify({ source: "registration", welcome: true }),
        },
      });

      return { user, organization };
    });

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Error al crear la cuenta: ${errorMessage}` },
      { status: 500 }
    );
  }
}
