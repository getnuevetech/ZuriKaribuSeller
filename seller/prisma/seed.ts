import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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
  const defaults = [
    { key: "platform_markup_percent", value: "15", label: "Platform Markup %", description: "Markup added to selling price for platform price", type: "NUMBER" as const, category: "pricing" },
    { key: "site_name", value: "ZuriKaribu Sellers", label: "Site Name", description: "Platform name", type: "TEXT" as const, category: "general" },
    { key: "site_tagline", value: "Discover African Fashion", label: "Site Tagline", type: "TEXT" as const, category: "general" },
    { key: "contact_email", value: adminEmail, label: "Contact Email", type: "TEXT" as const, category: "general" },
    { key: "max_product_images", value: "5", label: "Max Product Images", type: "NUMBER" as const, category: "products" },
    { key: "min_product_images", value: "3", label: "Min Product Images", type: "NUMBER" as const, category: "products" },
    { key: "auto_push_to_platforms", value: "false", label: "Auto Push to Platforms", type: "BOOLEAN" as const, category: "platforms" },
    { key: "ai_auto_optimize", value: "false", label: "AI Auto Optimize Descriptions", type: "BOOLEAN" as const, category: "ai" },
    { key: "currency", value: "USD", label: "Currency", type: "TEXT" as const, category: "pricing" },
    { key: "seller_approval_required", value: "true", label: "Seller Approval Required", type: "BOOLEAN" as const, category: "sellers" },
  ];

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
