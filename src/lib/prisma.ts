import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaClientInstance?: PrismaClient };

export const prismaClient =
  globalForPrisma.prismaClientInstance ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClientInstance = prismaClient;
}

