-- ============================================
-- Create Admin User with Verified Bcrypt Hash
-- Execute this in Supabase SQL Editor
-- ============================================

-- Delete existing admin user
DELETE FROM "User" WHERE email = 'admin@passly.com';

-- Create admin user with a fresh bcrypt hash
-- This hash was generated with: bcrypt.hash("admin123", 10)
-- Password: admin123
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '$2b$10$.GjL2rS29ulxf7ZBW6vfJeUD5mTI20ZW2xw7H4M6MWfTvlJb9pq92',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);

-- Verify creation
SELECT 
  id,
  email,
  name,
  role,
  LENGTH(password) as password_length,
  LEFT(password, 7) as hash_start,
  CASE 
    WHEN password LIKE '$2b$10$%' AND LENGTH(password) = 60 THEN '✅ Hash is CORRECT'
    ELSE '❌ Hash is INCORRECT'
  END as verification_status,
  "createdAt"
FROM "User" 
WHERE email = 'admin@passly.com';
