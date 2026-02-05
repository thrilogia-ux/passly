import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const email = emailRaw.toLowerCase().trim();

    const genericResponse = NextResponse.json(
      {
        message:
          "Si el email existe en nuestro sistema, te hemos enviado un enlace para restablecer la contraseña.",
      },
      { status: 200 }
    );

    if (!email) {
      return genericResponse;
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return genericResponse;
    }

    // Eliminar tokens anteriores no usados para este usuario
    await db.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/+$/, "") || "https://passly.ar";
    const resetLink = `${baseUrl}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Restablecer contraseña de PASSLY",
      html: `
        <p>Hola ${user.name || ""},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en PASSLY.</p>
        <p>Puedes crear una nueva contraseña haciendo clic en el siguiente enlace:</p>
        <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a></p>
        <p>Este enlace es válido por 30 minutos y solo puede usarse una vez.</p>
        <p>Si no fuiste tú quien solicitó este cambio, puedes ignorar este correo.</p>
      `,
    });

    return genericResponse;
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      {
        message:
          "Si el email existe en nuestro sistema, te hemos enviado un enlace para restablecer la contraseña.",
      },
      { status: 200 }
    );
  }
}

