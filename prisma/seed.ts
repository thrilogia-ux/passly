import { db as prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

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

  // Create Organization
  const organization = await prisma.organization.upsert({
    where: { slug: "demo-org" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo-org",
      tokenBalance: 100, // Tokens iniciales para testing
      tokenPlan: "STARTER",
    },
  });
  console.log("✅ Created Organization:", organization.name);

  // Create initial token transaction (bonus)
  await prisma.tokenTransaction.create({
    data: {
      organizationId: organization.id,
      type: "BONUS",
      amount: 100,
      description: "Welcome bonus tokens",
      metadata: JSON.stringify({ source: "seed", welcome: true }),
    },
  });
  console.log("✅ Created initial token transaction (100 tokens bonus)");

  // Create Client User
  const client = await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      email: "client@demo.com",
      password: await bcrypt.hash("client123", 10),
      name: "Demo Client",
      role: "CLIENT",
      organizationId: organization.id,
    },
  });
  console.log("✅ Created Client:", client.email);

  // Create Organizer
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@demo.com" },
    update: {},
    create: {
      email: "organizer@demo.com",
      password: await bcrypt.hash("organizer123", 10),
      name: "Demo Organizer",
      role: "ORGANIZER",
      organizationId: organization.id,
    },
  });
  console.log("✅ Created Organizer:", organizer.email);

  // Create Staff
  const staff = await prisma.user.upsert({
    where: { email: "staff@demo.com" },
    update: {},
    create: {
      email: "staff@demo.com",
      password: await bcrypt.hash("staff123", 10),
      name: "Demo Staff",
      role: "STAFF",
      organizationId: organization.id,
    },
  });
  console.log("✅ Created Staff:", staff.email);

  // Create Event
  const event = await prisma.event.create({
    data: {
      name: "Demo Event 2025",
      description: "Evento de demostración de PASSLY",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: "Hotel Demo, Buenos Aires",
      status: "ACTIVE",
      organizationId: organization.id,
      organizerId: organizer.id,
      allowReentry: true,
      maxReentries: 2,
    },
  });
  console.log("✅ Created Event:", event.name);

  // Create Guests
  const guests = await Promise.all([
    prisma.guest.upsert({
      where: { email: "vip@example.com" },
      update: {},
      create: {
        email: "vip@example.com",
        name: "John VIP",
        phone: "+1234567890",
        type: "VIP",
        tags: "premium,regular",
      },
    }),
    prisma.guest.upsert({
      where: { email: "press@example.com" },
      update: {},
      create: {
        email: "press@example.com",
        name: "Jane Press",
        phone: "+1234567891",
        type: "PRESS",
        tags: "tech",
      },
    }),
    prisma.guest.upsert({
      where: { email: "influencer@example.com" },
      update: {},
      create: {
        email: "influencer@example.com",
        name: "Bob Influencer",
        type: "INFLUENCER",
        tags: "fashion",
      },
    }),
  ]);
  console.log("✅ Created Guests:", guests.length);

  // Assign guests to event
  for (const guest of guests) {
    await prisma.guestEvent.create({
      data: {
        guestId: guest.id,
        eventId: event.id,
        customFields: {
          dietaryRestrictions: guest.type === "VIP" ? "Vegetarian" : null,
        },
      },
    });
  }
  console.log("✅ Assigned guests to event");

  // Generate QR codes
  const guestEvents = await prisma.guestEvent.findMany({
    where: { eventId: event.id },
  });

  for (const guestEvent of guestEvents) {
    // This would normally use the QR generation function
    // For seed, we'll just create a placeholder
    await prisma.qRCode.create({
      data: {
        token: `demo_token_${guestEvent.id}`,
        guestEventId: guestEvent.id,
        eventId: event.id,
        status: "VALID",
      },
    });
  }
  console.log("✅ Generated QR codes");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("  Super Admin: admin@passly.com / admin123");
  console.log("  Client: client@demo.com / client123");
  console.log("  Organizer: organizer@demo.com / organizer123");
  console.log("  Staff: staff@demo.com / staff123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });