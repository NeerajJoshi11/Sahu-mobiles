import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing User query...");
  try {
    const users = await prisma.user.findMany({
      include: { orders: true }
    });
    console.log(`Found ${users.length} users.`);
  } catch (err) {
    console.error("Query failed:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
