import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Prisma 6/7 handles connection string via prisma.config.ts or ENV, 
    // but we've downgraded to 6 so ENV is fine.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
