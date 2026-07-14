import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DEFAULT_APP_SETTINGS } from "../src/lib/app-settings";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function upsertAdmin(email: string, password: string, name: string) {
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: "ADMIN",
        adminProfile: {
          create: {
            title: "Platform Administrator",
            isSuperAdmin: true,
            isActive: true,
          },
        },
      },
    });
    console.log(`✅ Admin user created: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("   ⚠️  Change this password immediately after first login!");
  } else {
    // Ensure adminProfile exists and is active
    await prisma.adminProfile.upsert({
      where: { userId: existingAdmin.id },
      update: { isActive: true, isSuperAdmin: true },
      create: {
        userId: existingAdmin.id,
        title: "Platform Administrator",
        isSuperAdmin: true,
        isActive: true,
      },
    });
    // Ensure role is ADMIN
    if (existingAdmin.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: "ADMIN" },
      });
      console.log(`✅ User ${email} role updated to ADMIN`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${email}`);
    }
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create primary admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zurikaribu.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@ZuriKaribu2024!";
  await upsertAdmin(adminEmail, adminPassword, "ZuriKaribu Sellers Admin");

  // Create secondary admin user (e.g. ag@nuevetech.io)
  const secondaryAdminEmail = process.env.SECONDARY_ADMIN_EMAIL || "ag@nuevetech.io";
  const secondaryAdminPassword = process.env.SECONDARY_ADMIN_PASSWORD || "Admin@NueveTech2024!";
  if (secondaryAdminEmail !== adminEmail) {
    await upsertAdmin(secondaryAdminEmail, secondaryAdminPassword, "Platform Admin");
  }

  // Seed default app settings
  const defaults = DEFAULT_APP_SETTINGS.map((setting) =>
    setting.key === "contact_email" ? { ...setting, value: adminEmail } : setting
  );

  for (const setting of defaults) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Default settings seeded");

  console.log("\n🎉 Database seeding complete!");
  console.log(`Admin login: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
