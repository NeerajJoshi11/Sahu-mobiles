import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    console.log("Checking database connection...");
    const count = await prisma.coupon.count();
    console.log(`Successfully connected! Found ${count} coupons.`);
  } catch (error: any) {
    console.error("Database error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
