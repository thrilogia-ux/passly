-- ============================================
-- Create ENUM Types for PostgreSQL
-- Execute this in Supabase SQL Editor
-- ============================================

-- Create UserRole enum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT', 'ORGANIZER', 'STAFF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create EventStatus enum
DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create GuestType enum
DO $$ BEGIN
    CREATE TYPE "GuestType" AS ENUM ('PRESS', 'INFLUENCER', 'VIP', 'STAFF', 'PROVIDER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create InvitationStatus enum
DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create QRStatus enum
DO $$ BEGIN
    CREATE TYPE "QRStatus" AS ENUM ('VALID', 'USED', 'INVALIDATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify ENUMs were created
SELECT 
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('UserRole', 'EventStatus', 'GuestType', 'InvitationStatus', 'QRStatus')
GROUP BY typname
ORDER BY typname;
