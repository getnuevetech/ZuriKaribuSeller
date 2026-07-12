import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env", override: true });
dotenv.config({ path: ".env.local", override: true });

const FALLBACK_GENERATE_DATABASE_URL =
  "******localhost:5432/zurikaribu?schema=public";

function isGenerateOnlyCommand(): boolean {
  const lifecycleEvent = process.env.npm_lifecycle_event;

  if (lifecycleEvent === "postinstall" || lifecycleEvent === "db:generate") {
    return true;
  }

  const argv = process.argv.join(" ");
  return /\bgenerate\b/.test(argv) && !/\b(migrate|validate|db)\b/.test(argv);
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function getDatabaseUrl(): string {
  const rawDatabaseUrl = process.env.DATABASE_URL?.trim();

  if (!rawDatabaseUrl) {
    if (isGenerateOnlyCommand()) {
      return FALLBACK_GENERATE_DATABASE_URL;
    }

    throw new Error(
      "DATABASE_URL is not set. Copy /home/runner/work/ZuriKaribuSeller/ZuriKaribuSeller/seller/.env.example to /home/runner/work/ZuriKaribuSeller/ZuriKaribuSeller/seller/.env (or set it in .env.local) before running Prisma database commands."
    );
  }

  const databaseUrl = stripWrappingQuotes(rawDatabaseUrl);

  try {
    const parsedUrl = new URL(databaseUrl);

    if (!["postgresql:", "postgres:"].includes(parsedUrl.protocol)) {
      throw new Error("unsupported protocol");
    }
  } catch {
    if (isGenerateOnlyCommand()) {
      return FALLBACK_GENERATE_DATABASE_URL;
    }

    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string such as ******localhost:5432/database?schema=public. If your password contains special characters, URL-encode them."
    );
  }

  return databaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
