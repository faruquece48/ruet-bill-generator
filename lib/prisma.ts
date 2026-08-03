import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let visitorSchemaReady: Promise<unknown> | undefined;

export function ensureVisitorSchema() {
  visitorSchemaReady ??= prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "VisitorSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastSeenDay" TEXT NOT NULL
    )
  `).then(async () => {
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "VisitorSession_lastSeenAt_idx" ON "VisitorSession"("lastSeenAt")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "VisitorSession_lastSeenDay_idx" ON "VisitorSession"("lastSeenDay")');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VisitEvent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "visitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "visitDay" TEXT NOT NULL
      )
    `);
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "VisitEvent_visitDay_idx" ON "VisitEvent"("visitDay")');
  });
  return visitorSchemaReady;
}
