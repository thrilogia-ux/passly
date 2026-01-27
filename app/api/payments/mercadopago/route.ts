import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getPackagePriceARS } from "@/lib/pricing";

// Configurar cliente MercadoPago v2
const getClient = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return new MercadoPagoConfig({ accessToken });
};

const createPaymentSchema = z.object({
  amount: z.number().positive(), // Precio en ARS
  tokens: z.number().int().positive(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que MercadoPago esté configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("❌ MERCADOPAGO_ACCESS_TOKEN no está configurado");
      return NextResponse.json(
        { error: "MercadoPago no está configurado. Contacta al administrador." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    // Usar el precio en ARS enviado desde el frontend, o calcularlo
    const totalAmountARS = data.amount || getPackagePriceARS(data.tokens);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";

    // Crear cliente y preferencia de MercadoPago v2
    const client = getClient();
    const preference = new Preference(client);

    // Crear preferencia de pago
    const response = await preference.create({
      body: {
        items: [
          {
            id: `tokens-${data.tokens}`,
            title: `${data.tokens} Tokens PASSLY`,
            quantity: 1,
            unit_price: totalAmountARS,
            currency_id: "ARS", // Pesos argentinos para MercadoPago Argentina
          },
        ],
        payer: {
          email: session.user.email || "",
          name: session.user.name || "",
        },
        back_urls: {
          success: `${baseUrl}/dashboard/tokens?payment=success`,
          failure: `${baseUrl}/dashboard/tokens?payment=failure`,
          pending: `${baseUrl}/dashboard/tokens?payment=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/payments/mercadopago/webhook`,
        metadata: {
          organizationId: session.user.organizationId,
          tokens: data.tokens.toString(),
          userId: session.user.id,
        },
      },
    });

    console.log("✅ MercadoPago preference created:", response.id);

    return NextResponse.json({
      success: true,
      paymentUrl: response.init_point,
      preferenceId: response.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.issues },
        { status: 400 }
      );
    }

    console.error("❌ Error creating MercadoPago payment:", error);
    const errorMessage = error?.message || "Error desconocido";

    return NextResponse.json(
      {
        error: "Error al crear el pago",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Callback de retorno (cuando el usuario vuelve de MercadoPago)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
    const status = searchParams.get("status") || searchParams.get("collection_status");
    const externalReference = searchParams.get("external_reference");

    console.log("📥 MercadoPago callback:", { paymentId, status, externalReference });

    // Si no hay payment_id, es solo una redirección de retorno
    if (!paymentId) {
      return NextResponse.redirect(
        new URL("/dashboard/tokens?payment=unknown", request.url)
      );
    }

    // Verificar que MercadoPago esté configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("❌ MERCADOPAGO_ACCESS_TOKEN no está configurado");
      return NextResponse.redirect(
        new URL("/dashboard/tokens?payment=error", request.url)
      );
    }

    // Obtener información del pago desde MercadoPago
    const client = getClient();
    const payment = new Payment(client);

    const paymentInfo = await payment.get({ id: paymentId });
    console.log("📋 Payment info:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      metadata: paymentInfo.metadata,
    });

    const metadata = paymentInfo.metadata;

    if (!metadata || !metadata.organizationId || !metadata.tokens) {
      console.error("❌ Invalid payment metadata:", metadata);
      return NextResponse.redirect(
        new URL("/dashboard/tokens?payment=error&reason=metadata", request.url)
      );
    }

    // Si el pago fue aprobado, agregar tokens
    if (paymentInfo.status === "approved") {
      const tokensToAdd = parseInt(metadata.tokens, 10);
      const organizationId = metadata.organizationId;

      // Verificar si ya procesamos este pago (evitar duplicados)
      const existingTransaction = await db.tokenTransaction.findFirst({
        where: {
          metadata: {
            contains: paymentId,
          },
        },
      });

      if (existingTransaction) {
        console.log("⚠️ Payment already processed:", paymentId);
        return NextResponse.redirect(
          new URL("/dashboard/tokens?payment=success&already=true", request.url)
        );
      }

      // Agregar tokens a la organización
      await db.organization.update({
        where: { id: organizationId },
        data: {
          tokenBalance: {
            increment: tokensToAdd,
          },
        },
      });

      // Registrar transacción
      await db.tokenTransaction.create({
        data: {
          organizationId: organizationId,
          type: "PURCHASE",
          amount: tokensToAdd,
          description: `Compra via MercadoPago - ${tokensToAdd} tokens`,
          metadata: JSON.stringify({
            paymentId,
            paymentMethod: "mercadopago",
            status: paymentInfo.status,
          }),
        },
      });

      console.log(`✅ Added ${tokensToAdd} tokens to organization ${organizationId}`);

      return NextResponse.redirect(
        new URL(`/dashboard/tokens?payment=success&tokens=${tokensToAdd}`, request.url)
      );
    }

    // Otros estados
    return NextResponse.redirect(
      new URL(`/dashboard/tokens?payment=${paymentInfo.status}`, request.url)
    );
  } catch (error: any) {
    console.error("❌ Error processing MercadoPago callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard/tokens?payment=error", request.url)
    );
  }
}
