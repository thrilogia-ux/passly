-- ============================================
-- Create ENUM Types and Update Columns
-- Execute this in Supabase SQL Editor
-- ============================================

-- Step 1: Create ENUM types
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT', 'ORGANIZER', 'STAFF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GuestType" AS ENUM ('PRESS', 'INFLUENCER', 'VIP', 'STAFF', 'PROVIDER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "QRStatus" AS ENUM ('VALID', 'USED', 'INVALIDATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Alter columns to use ENUM types (remove defaults first, then alter, then add defaults back)
-- User.role
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" 
ALTER COLUMN "role" TYPE "UserRole" 
USING "role"::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT'::"UserRole";

-- Event.status
ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" 
ALTER COLUMN "status" TYPE "EventStatus" 
USING "status"::"EventStatus";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"EventStatus";

-- Guest.type
ALTER TABLE "Guest" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Guest" 
ALTER COLUMN "type" TYPE "GuestType" 
USING "type"::"GuestType";
ALTER TABLE "Guest" ALTER COLUMN "type" SET DEFAULT 'VIP'::"GuestType";

-- Invitation.status
ALTER TABLE "Invitation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Invitation" 
ALTER COLUMN "status" TYPE "InvitationStatus" 
USING "status"::"InvitationStatus";
ALTER TABLE "Invitation" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"InvitationStatus";

-- QRCode.status
ALTER TABLE "QRCode" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "QRCode" 
ALTER COLUMN "status" TYPE "QRStatus" 
USING "status"::"QRStatus";
ALTER TABLE "QRCode" ALTER COLUMN "status" SET DEFAULT 'VALID'::"QRStatus";

-- TokenTransaction.type (this one stays as TEXT, it's not an enum in schema)

-- Step 3: Verify ENUMs were created
SELECT 
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('UserRole', 'EventStatus', 'GuestType', 'InvitationStatus', 'QRStatus')
GROUP BY typname
ORDER BY typname;

-- Success message
SELECT '✅ ENUMs created and columns updated successfully!' as message;
