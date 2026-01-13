import crypto from "crypto";

/**
 * Generate a unique confirmation token for invitation RSVP
 */
export function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
