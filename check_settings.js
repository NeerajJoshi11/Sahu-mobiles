const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.setting.findUnique({
    where: { key: "express_pincodes" }
  });
  console.log("Express Pincodes:", setting?.value);
}

main().catch(console.error).finally(() => prisma.$disconnect());
