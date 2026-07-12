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

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zurikaribu.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@ZuriKaribu2024!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: "ZuriKaribu Sellers Admin",
        role: "ADMIN",
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("   ⚠️  Change this password immediately after first login!");
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
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
