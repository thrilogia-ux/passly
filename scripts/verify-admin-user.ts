import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function verifyAdminUser() {
  console.log("Verifying admin user...\n");

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: "admin@passly.com" },
    });

    if (!user) {
      console.log("❌ User not found!");
      console.log("\nCreating user with correct password hash...");
      
      const passwordHash = await bcrypt.hash("admin123", 10);
      console.log("Generated hash:", passwordHash);
      
      const newUser = await prisma.user.create({
        data: {
          email: "admin@passly.com",
          password: passwordHash,
          name: "Super Admin",
          role: "SUPER_ADMIN",
        },
      });
      
      console.log("✅ User created:", newUser.email);
      console.log("   ID:", newUser.id);
      console.log("   Role:", newUser.role);
    } else {
      console.log("✅ User found:");
      console.log("   Email:", user.email);
      console.log("   ID:", user.id);
      console.log("   Role:", user.role);
      console.log("   Password hash:", user.password);
      
      // Test password verification
      const testPassword = "admin123";
      const isValid = await bcrypt.compare(testPassword, user.password);
      
      if (isValid) {
        console.log("\n✅ Password verification: CORRECT");
      } else {
        console.log("\n❌ Password verification: FAILED");
        console.log("\nUpdating password with correct hash...");
        
        const newHash = await bcrypt.hash("admin123", 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        });
        
        console.log("✅ Password updated with new hash:", newHash);
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code === "P1001") {
      console.log("\n⚠️  Cannot connect to database. Make sure DATABASE_URL is set correctly.");
    }
  }
}

verifyAdminUser()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
