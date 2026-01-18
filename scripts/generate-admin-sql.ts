import bcrypt from "bcryptjs";

async function generateAdminSQL() {
  console.log("Generating SQL to create admin user...\n");
  
  // Generate bcrypt hash for password "admin123"
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  console.log("Copy and paste this SQL into Supabase SQL Editor:\n");
  console.log("=".repeat(60));
  console.log(`
-- Create Super Admin User
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@passly.com',
  '${passwordHash}',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Demo Organization
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

-- Success message
SELECT 'Admin user created successfully! Email: admin@passly.com, Password: admin123' as message;
`);
  console.log("=".repeat(60));
  console.log("\n✅ SQL generated! Copy the SQL above and run it in Supabase SQL Editor.");
}

generateAdminSQL().catch(console.error);
