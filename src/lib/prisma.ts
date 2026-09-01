import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Mock Prisma client for when DATABASE_URL is not set
function createMockPrisma(): PrismaClient {
  const handler = {
    get(_target: any, prop: string) {
      if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
      return new Proxy(() => {}, {
        get(_t, p) { return handler.get(_t, p as string); },
        apply(_t, _this, args) {
          console.log("[Mock Prisma] Called:", prop, JSON.stringify(args).slice(0, 100));
          // Return empty results for findMany, null for findUnique, etc.
          if (prop === "findMany") return Promise.resolve([]);
          if (prop === "findUnique") return Promise.resolve(null);
          if (prop === "findFirst") return Promise.resolve(null);
          if (prop === "count") return Promise.resolve(0);
          if (prop === "create") return Promise.resolve({});
          if (prop === "update") return Promise.resolve({});
          if (prop === "upsert") return Promise.resolve({});
          if (prop === "delete") return Promise.resolve({});
          return Promise.resolve(null);
        },
      });
    },
    apply() { return this; },
  };
  return new Proxy({} as any, handler);
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL not set, using mock Prisma client");
    return createMockPrisma();
  }
  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  } catch (e) {
    console.warn("Failed to initialize Prisma adapter:", e);
    return createMockPrisma();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
