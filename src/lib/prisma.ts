import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Mock Prisma client for when DATABASE_URL is not set
function createMockPrisma(): PrismaClient {
  // Lazy import centralized mock data
  const getMock = () => {
    try {
      return require("./mock-data");
    } catch { return null; }
  };

  // Cache for model proxies
  const models: Record<string, any> = {};

  const mockModel = (modelName: string) => {
    const methods: Record<string, Function> = {};
    return new Proxy({}, {
      get(_target, prop: string) {
        if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
        if (!methods[prop]) {
          methods[prop] = (...args: any[]) => {
            const mock = getMock();
            const q = args[0] || {};
            const lowerModel = modelName.toLowerCase();

            // Return rich mock data based on model and query
            if (lowerModel === "user" && String(prop).includes("findUnique")) {
              const email = q.where?.email || "";
              if (email.includes("admin")) return Promise.resolve(mock?.MOCK_ADMIN || null);
              if (email) return Promise.resolve(mock?.MOCK_USER || null);
              return Promise.resolve(mock?.MOCK_USER || null);
            }
            if (lowerModel === "user" && String(prop).includes("findMany")) {
              return Promise.resolve(mock?.getMockUsers() || []);
            }
            if (lowerModel === "user" && String(prop) === "count") {
              return Promise.resolve(3);
            }
            if (lowerModel === "invoice" && String(prop).includes("findMany")) {
              return Promise.resolve(mock?.getMockInvoices() || []);
            }
            if (lowerModel === "invoice" && String(prop) === "count") {
              return Promise.resolve(5);
            }
            if (lowerModel === "invoice" && String(prop).includes("findUnique")) {
              const id = q.where?.id || "";
              const invoices = mock?.getMockInvoices() || [];
              const found = invoices.find((i: any) => i.id === id);
              return Promise.resolve(found || null);
            }
            if (lowerModel === "client" && String(prop).includes("findMany")) {
              return Promise.resolve(mock?.getMockClients() || []);
            }
            if (lowerModel === "payment" && String(prop).includes("findMany")) {
              return Promise.resolve(mock?.getMockPayments() || []);
            }
            if (lowerModel === "payment" && String(prop) === "count") {
              return Promise.resolve(1);
            }
            if (lowerModel === "dunningevent" && String(prop).includes("findMany")) {
              return Promise.resolve(mock?.getMockDunningEvents() || []);
            }
            if (lowerModel === "dunningevent" && String(prop) === "count") {
              return Promise.resolve(5);
            }
            if (lowerModel === "dispute" && String(prop).includes("findMany")) {
              return Promise.resolve(mock?.getMockDisputes() || []);
            }
            if (lowerModel === "dispute" && String(prop) === "count") {
              return Promise.resolve(1);
            }
            if (String(prop).includes("create")) return Promise.resolve({ id: "mock-" + Date.now() });
            if (String(prop).includes("update") || String(prop).includes("upsert")) return Promise.resolve({ id: "mock-updated" });
            if (String(prop).includes("delete")) return Promise.resolve({ id: "mock-deleted" });
            return Promise.resolve(null);
          };
        }
        return methods[prop];
      },
    });
  };

  const handler = {
    get(_target: any, prop: string) {
      if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
      if (prop === "$connect" || prop === "$disconnect" || prop === "$on" || prop === "$use" || prop === "$extends" || prop === "$transaction") {
        return () => Promise.resolve();
      }
      if (!models[prop]) models[prop] = mockModel(String(prop));
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
