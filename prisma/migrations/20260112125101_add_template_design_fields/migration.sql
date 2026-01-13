-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvitationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "htmlContent" TEXT,
    "cssContent" TEXT,
    "backgroundImage" TEXT,
    "qrPosition" TEXT,
    "qrSize" INTEGER DEFAULT 200,
    "eventId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvitationTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvitationTemplate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvitationTemplate" ("createdAt", "cssContent", "htmlContent", "id", "isActive", "name", "organizationId", "updatedAt", "version") SELECT "createdAt", "cssContent", "htmlContent", "id", "isActive", "name", "organizationId", "updatedAt", "version" FROM "InvitationTemplate";
DROP TABLE "InvitationTemplate";
ALTER TABLE "new_InvitationTemplate" RENAME TO "InvitationTemplate";
CREATE INDEX "InvitationTemplate_organizationId_idx" ON "InvitationTemplate"("organizationId");
CREATE INDEX "InvitationTemplate_eventId_idx" ON "InvitationTemplate"("eventId");
CREATE INDEX "InvitationTemplate_isActive_idx" ON "InvitationTemplate"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
