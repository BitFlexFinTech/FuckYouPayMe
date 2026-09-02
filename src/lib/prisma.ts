import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Mock Prisma client for when DATABASE_URL is not set
function createMockPrisma(): PrismaClient {
  // Build a complete mock that handles chained model access like prisma.user.findUnique()
  const mockModel = (modelName: string) => {
    // Return a plain object with async methods instead of a Proxy
    const methods: Record<string, Function> = {};
    const handler = {
      get(_target: any, prop: string) {
        if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
        if (!methods[prop]) {
          methods[prop] = (...args: any[]) => {
            console.log(`[Mock DB] ${modelName}.${String(prop)}`, args[0] ? JSON.stringify(args[0]).slice(0, 100) : "");
            if (String(prop).includes("findMany") || String(prop).includes("findFirst")) return Promise.resolve([]);
            if (String(prop).includes("findUnique") || String(prop).includes("count")) return Promise.resolve(prop === "count" ? 0 : null);
            if (String(prop).includes("create")) return Promise.resolve({ id: "mock-" + Date.now() });
            if (String(prop).includes("update") || String(prop).includes("upsert")) return Promise.resolve({ id: "mock-updated" });
            if (String(prop).includes("delete")) return Promise.resolve({ id: "mock-deleted" });
            return Promise.resolve(null);
          };
        }
        return methods[prop];
      },
    };
    return new Proxy({}, handler);
  };

  const models: Record<string, any> = {};
  const handler = {
    get(_target: any, prop: string) {
      if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
      if (prop === "$connect" || prop === "$disconnect" || prop === "$on" || prop === "$use" || prop === "$extends" || prop === "$transaction") {
        return () => Promise.resolve();
      }
      if (!models[prop]) {
        models[prop] = mockModel(String(prop));
      }
      return models[prop];
    },
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
