import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

export interface QRTokenPayload {
  guestEventId: string;
  eventId: string;
  guestId: string;
  iat: number;
  exp: number;
}

/**
 * Generate a QR token for a guest-event pair
 */
export async function generateQRToken(guestEventId: string) {
  const guestEvent = await db.guestEvent.findUnique({
    where: { id: guestEventId },
    include: {
      guest: true,
      event: true,
    },
  });

  if (!guestEvent) {
    throw new Error("Guest event not found");
  }

  // Token expires in 24 hours by default (for screenshot prevention)
  const expiresIn = "24h";
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const payload: Omit<QRTokenPayload, "iat" | "exp"> = {
    guestEventId: guestEvent.id,
    eventId: guestEvent.eventId,
    guestId: guestEvent.guestId,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });

  // Create or update QRCode record
  const qrCode = await db.qRCode.upsert({
    where: { guestEventId },
    create: {
      token,
      guestEventId,
      eventId: guestEvent.eventId,
      expiresAt,
      status: "VALID",
    },
    update: {
      token,
      expiresAt,
      status: "VALID",
    },
  });

  return {
    token,
    qrCode,
    expiresAt,
  };
}

/**
 * Generate QR code image as data URL
 */
export async function generateQRImage(token: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 1,
    });
    return dataUrl;
  } catch (error) {
    throw new Error("Failed to generate QR code image");
  }
}

/**
 * Verify QR token and return guest event info
 */
export async function verifyQRToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as QRTokenPayload;

    // Check if QR code exists in database
    const qrCode = await db.qRCode.findUnique({
      where: { token },
      include: {
        guestEvent: {
          include: {
            guest: true,
            event: true,
          },
        },
      },
    });

    if (!qrCode) {
      return { valid: false, error: "QR code not found" };
    }

    if (qrCode.status !== "VALID") {
      return { valid: false, error: `QR code is ${qrCode.status.toLowerCase()}` };
    }

    // Check expiration
    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
      return { valid: false, error: "QR code has expired" };
    }

    // Check event validity dates
    const event = qrCode.guestEvent.event;
    if (event.validFrom && new Date(event.validFrom) > new Date()) {
      return { valid: false, error: "Event not yet valid" };
    }
    if (event.validUntil && new Date(event.validUntil) < new Date()) {
      return { valid: false, error: "Event has expired" };
    }

    return {
      valid: true,
      qrCode,
      guestEvent: qrCode.guestEvent,
      guest: qrCode.guestEvent.guest,
      event: qrCode.guestEvent.event,
    };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, error: "QR code has expired" };
    }
    if (error.name === "JsonWebTokenError") {
      return { valid: false, error: "Invalid QR code" };
    }
    return { valid: false, error: "Verification failed" };
  }
}