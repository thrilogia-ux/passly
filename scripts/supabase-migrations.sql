-- ============================================
-- PASSLY - Database Migrations for PostgreSQL
-- Execute this in Supabase SQL Editor
-- ============================================

-- Migration 1: Initial Schema
-- CreateTable: Organization (must be first due to foreign keys)
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Event
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizationId" TEXT NOT NULL,
    "organizerId" TEXT,
    "allowReentry" BOOLEAN NOT NULL DEFAULT true,
    "maxReentries" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP,
    "validUntil" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Guest
CREATE TABLE IF NOT EXISTS "Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'VIP',
    "tags" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: GuestEvent
CREATE TABLE IF NOT EXISTS "GuestEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "customFields" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuestEvent_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuestEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: InvitationTemplate
CREATE TABLE IF NOT EXISTS "InvitationTemplate" (
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
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvitationTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvitationTemplate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Invitation
CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestEventId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP,
    "confirmedAt" TIMESTAMP,
    "rejectedAt" TIMESTAMP,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "confirmationToken" TEXT,
    "rsvpResponse" TEXT,
    "dietaryRestrictions" TEXT,
    "accessibilityNeeds" TEXT,
    "additionalGuests" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_guestEventId_fkey" FOREIGN KEY ("guestEventId") REFERENCES "GuestEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InvitationTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: QRCode
CREATE TABLE IF NOT EXISTS "QRCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "guestEventId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QRCode_guestEventId_fkey" FOREIGN KEY ("guestEventId") REFERENCES "GuestEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QRCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: CheckIn
CREATE TABLE IF NOT EXISTS "CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCodeId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "checkedInBy" TEXT,
    "checkedInAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zone" TEXT,
    "notes" TEXT,
    CONSTRAINT "CheckIn_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_checkedInBy_fkey" FOREIGN KEY ("checkedInBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Migration 2: Token System
CREATE TABLE IF NOT EXISTS "TokenTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TokenTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Add tokenBalance and tokenPlan to Organization (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Organization' AND column_name = 'tokenBalance') THEN
        ALTER TABLE "Organization" ADD COLUMN "tokenBalance" INTEGER NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Organization' AND column_name = 'tokenPlan') THEN
        ALTER TABLE "Organization" ADD COLUMN "tokenPlan" TEXT;
    END IF;
END $$;

-- Create Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");

CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX IF NOT EXISTS "Organization_slug_idx" ON "Organization"("slug");

CREATE INDEX IF NOT EXISTS "Event_organizationId_idx" ON "Event"("organizationId");
CREATE INDEX IF NOT EXISTS "Event_organizerId_idx" ON "Event"("organizerId");
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");
CREATE INDEX IF NOT EXISTS "Event_date_idx" ON "Event"("date");

CREATE UNIQUE INDEX IF NOT EXISTS "Guest_email_key" ON "Guest"("email");
CREATE INDEX IF NOT EXISTS "Guest_email_idx" ON "Guest"("email");
CREATE INDEX IF NOT EXISTS "Guest_type_idx" ON "Guest"("type");

CREATE INDEX IF NOT EXISTS "GuestEvent_guestId_idx" ON "GuestEvent"("guestId");
CREATE INDEX IF NOT EXISTS "GuestEvent_eventId_idx" ON "GuestEvent"("eventId");
CREATE UNIQUE INDEX IF NOT EXISTS "GuestEvent_guestId_eventId_key" ON "GuestEvent"("guestId", "eventId");

CREATE INDEX IF NOT EXISTS "InvitationTemplate_organizationId_idx" ON "InvitationTemplate"("organizationId");
CREATE INDEX IF NOT EXISTS "InvitationTemplate_eventId_idx" ON "InvitationTemplate"("eventId");
CREATE INDEX IF NOT EXISTS "InvitationTemplate_isActive_idx" ON "InvitationTemplate"("isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_guestEventId_key" ON "Invitation"("guestEventId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_confirmationToken_key" ON "Invitation"("confirmationToken");
CREATE INDEX IF NOT EXISTS "Invitation_status_idx" ON "Invitation"("status");
CREATE INDEX IF NOT EXISTS "Invitation_sentAt_idx" ON "Invitation"("sentAt");
CREATE INDEX IF NOT EXISTS "Invitation_eventId_idx" ON "Invitation"("eventId");
CREATE INDEX IF NOT EXISTS "Invitation_confirmationToken_idx" ON "Invitation"("confirmationToken");
CREATE INDEX IF NOT EXISTS "Invitation_rsvpResponse_idx" ON "Invitation"("rsvpResponse");

CREATE UNIQUE INDEX IF NOT EXISTS "QRCode_token_key" ON "QRCode"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "QRCode_guestEventId_key" ON "QRCode"("guestEventId");
CREATE INDEX IF NOT EXISTS "QRCode_token_idx" ON "QRCode"("token");
CREATE INDEX IF NOT EXISTS "QRCode_eventId_idx" ON "QRCode"("eventId");
CREATE INDEX IF NOT EXISTS "QRCode_status_idx" ON "QRCode"("status");
CREATE INDEX IF NOT EXISTS "QRCode_expiresAt_idx" ON "QRCode"("expiresAt");

CREATE INDEX IF NOT EXISTS "CheckIn_qrCodeId_idx" ON "CheckIn"("qrCodeId");
CREATE INDEX IF NOT EXISTS "CheckIn_eventId_idx" ON "CheckIn"("eventId");
CREATE INDEX IF NOT EXISTS "CheckIn_checkedInAt_idx" ON "CheckIn"("checkedInAt");
CREATE INDEX IF NOT EXISTS "CheckIn_zone_idx" ON "CheckIn"("zone");

CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE INDEX IF NOT EXISTS "TokenTransaction_organizationId_idx" ON "TokenTransaction"("organizationId");
CREATE INDEX IF NOT EXISTS "TokenTransaction_type_idx" ON "TokenTransaction"("type");
CREATE INDEX IF NOT EXISTS "TokenTransaction_createdAt_idx" ON "TokenTransaction"("createdAt");

-- Create Admin User and Demo Organization
INSERT INTO "Organization" (id, name, slug, "tokenBalance", "tokenPlan", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Demo Organization',
  'demo-org',
  100,
  'STARTER',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '$2b$10$cISvqIYZuWt60qKgNb.YBO6ekkX4AFcL3Mf6ZBDZy.aTjmPofq80u',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT '✅ Database migrations completed! Admin user created: admin@passly.com / admin123' as message;
