-- ============================================
-- Create Super Admin User
-- Execute this in Supabase SQL Editor
-- ============================================
-- Email: admin@passly.com
-- Password: admin123
-- Role: SUPER_ADMIN

-- Delete existing admin user (if exists)
DELETE FROM "User" WHERE email = 'admin@passly.com';

-- Create Super Admin user with bcrypt hash
-- Hash generated with: bcrypt.hash("admin123", 10)
-- Password: admin123
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '$2b$10$ydiPNBzviVcRheix0cZV3.HALc9KOdPBFNPv9XFcaAB5UU0AAvJoK',
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

-- Success message
SELECT '✅ Super Admin creado exitosamente! Email: admin@passly.com, Password: admin123' as message;
