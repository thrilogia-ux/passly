import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating admin user...");

  try {
    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
      where: { email: "admin@passly.com" },
      update: {},
      create: {
        email: "admin@passly.com",
        password: await bcrypt.hash("admin123", 10),
        name: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log("✅ Created Super Admin:", superAdmin.email);
    console.log("   Email: admin@passly.com");
    console.log("   Password: admin123");

    // Create Organization
    const organization = await prisma.organization.upsert({
      where: { slug: "demo-org" },
      update: {},
      create: {
        name: "Demo Organization",
        slug: "demo-org",
        tokenBalance: 100,
        tokenPlan: "STARTER",
      },
    });
    console.log("✅ Created Organization:", organization.name);

    console.log("\n🎉 Admin user created successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@passly.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
