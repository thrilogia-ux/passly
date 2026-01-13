-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestEventId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME,
    "confirmedAt" DATETIME,
    "rejectedAt" DATETIME,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "confirmationToken" TEXT,
    "rsvpResponse" TEXT,
    "dietaryRestrictions" TEXT,
    "accessibilityNeeds" TEXT,
    "additionalGuests" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invitation_guestEventId_fkey" FOREIGN KEY ("guestEventId") REFERENCES "GuestEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InvitationTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invitation" ("confirmedAt", "createdAt", "emailBody", "emailSubject", "eventId", "guestEventId", "id", "rejectedAt", "sentAt", "status", "templateId", "updatedAt") SELECT "confirmedAt", "createdAt", "emailBody", "emailSubject", "eventId", "guestEventId", "id", "rejectedAt", "sentAt", "status", "templateId", "updatedAt" FROM "Invitation";
DROP TABLE "Invitation";
ALTER TABLE "new_Invitation" RENAME TO "Invitation";
CREATE UNIQUE INDEX "Invitation_guestEventId_key" ON "Invitation"("guestEventId");
CREATE UNIQUE INDEX "Invitation_confirmationToken_key" ON "Invitation"("confirmationToken");
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");
CREATE INDEX "Invitation_sentAt_idx" ON "Invitation"("sentAt");
CREATE INDEX "Invitation_eventId_idx" ON "Invitation"("eventId");
CREATE INDEX "Invitation_confirmationToken_idx" ON "Invitation"("confirmationToken");
CREATE INDEX "Invitation_rsvpResponse_idx" ON "Invitation"("rsvpResponse");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
