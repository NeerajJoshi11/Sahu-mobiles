import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function test() {
  console.log("Starting DB Probe...");
  try {
    // 1. Test connection
    console.log("Attempting to connect to Prisma...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully.");

    // 2. Test bcrypt
    console.log("Testing bcrypt hashing...");
    const hash = await bcrypt.hash("test-password", 10);
    console.log("✅ Bcrypt hashed successfully:", hash.substring(0, 10) + "...");

    // 3. Test User query
    console.log("Querying User table...");
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Count: ${userCount}`);

    // 4. Test User creation (optional, but let's just try to find one)
    const testUser = await prisma.user.findFirst();
    console.log("✅ findFirst executed successfully.");

  } catch (err: any) {
    console.error("❌ PROBE FAILED:");
    console.error("Error Message:", err.message);
    console.error("Error Code:", err.code);
    console.error("Full Error Stack:", err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
