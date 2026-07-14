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

async function upsertAdmin(
  email: string,
  password: string,
  name: string,
  updatePassword = false
) {
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
    // Update password when explicitly requested (e.g. password reset via seed)
    if (updatePassword) {
      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashed },
      });
      console.log(`🔑 Password updated for: ${email}`);
      console.log("   ⚠️  Change this password immediately after first login!");
    }
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create primary admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zurikaribu.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@ZuriKaribu2024!";
  if (!adminPassword.trim()) {
    throw new Error("ADMIN_PASSWORD must not be empty");
  }
  // Password is updated when ADMIN_PASSWORD is explicitly set in the environment
  await upsertAdmin(adminEmail, adminPassword, "ZuriKaribu Sellers Admin", !!process.env.ADMIN_PASSWORD);

  // Create secondary admin user (e.g. ag@nuevetech.io)
  const secondaryAdminEmail = process.env.SECONDARY_ADMIN_EMAIL || "ag@nuevetech.io";
  const secondaryAdminPasswordEnv = process.env.SECONDARY_ADMIN_PASSWORD;
  const secondaryAdminPassword = secondaryAdminPasswordEnv || "Admin@NueveTech2024!";
  if (secondaryAdminPasswordEnv !== undefined && !secondaryAdminPasswordEnv.trim()) {
    throw new Error("SECONDARY_ADMIN_PASSWORD must not be empty when set");
  }
  if (secondaryAdminEmail !== adminEmail) {
    await upsertAdmin(
      secondaryAdminEmail,
      secondaryAdminPassword,
      "Platform Admin",
      !!secondaryAdminPasswordEnv
    );
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
