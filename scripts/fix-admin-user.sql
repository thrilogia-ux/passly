-- ============================================
-- Fix Admin User - Execute in Supabase SQL Editor
-- ============================================

-- Step 1: Delete existing admin user (if exists)
DELETE FROM "User" WHERE email = 'admin@passly.com';

-- Step 2: Create Super Admin User with correct bcrypt hash
-- Password: admin123
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '$2b$10$UeskT.xswhPXeDVE/vNqkempfvt.a.rde6BDcfRP12aoCsvLC3Q6S',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);

-- Step 3: Verify the user was created correctly
SELECT 
  id,
  email,
  name,
  role,
  LENGTH(password) as password_length,
  CASE 
    WHEN password LIKE '$2b$10$%' THEN '✅ Password hash format: CORRECT'
    ELSE '❌ Password hash format: INCORRECT'
  END as password_status,
  "createdAt"
FROM "User" 
WHERE email = 'admin@passly.com';

-- Step 4: Check if organization exists (needed for some features)
SELECT 
  id,
  name,
  slug,
  "tokenBalance"
FROM "Organization" 
WHERE slug = 'demo-org'
LIMIT 1;
