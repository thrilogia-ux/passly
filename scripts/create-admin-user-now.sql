-- ============================================
-- Create Admin User - Execute in Supabase SQL Editor
-- ============================================
-- Password: admin123
-- Email: admin@passly.com

-- Delete existing admin user (if exists)
DELETE FROM "User" WHERE email = 'admin@passly.com';

-- Create admin user with bcrypt hash
-- Hash generated with: bcrypt.hash("admin123", 10)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '$2b$10$hvuYmuBvOPPf/yuuR/SmbuIFe5GUo3iB32LgUVUQtCzPgBSX0wAyu',
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
  "createdAt"
FROM "User" 
WHERE email = 'admin@passly.com';
