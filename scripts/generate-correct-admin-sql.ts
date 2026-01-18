import bcrypt from "bcryptjs";

async function generateCorrectAdminSQL() {
  console.log("Generating correct admin user SQL with bcrypt hash...\n");
  
  // Generate bcrypt hash for password "admin123"
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  console.log("Copy and paste this SQL into Supabase SQL Editor:\n");
  console.log("=".repeat(70));
  console.log(`
-- Delete existing admin user if exists (to recreate with correct hash)
DELETE FROM "User" WHERE email = 'admin@passly.com';

-- Create Super Admin User with correct bcrypt hash
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '${passwordHash}',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT 
  id,
  email,
  name,
  role,
  CASE 
    WHEN password LIKE '$2b$10$%' THEN '✅ Password hash format: CORRECT'
    ELSE '❌ Password hash format: INCORRECT'
  END as password_status
FROM "User" 
WHERE email = 'admin@passly.com';
`);
  console.log("=".repeat(70));
  console.log("\n✅ SQL generated with correct bcrypt hash!");
  console.log("   Password: admin123");
  console.log("   Hash:", passwordHash);
}

generateCorrectAdminSQL().catch(console.error);
