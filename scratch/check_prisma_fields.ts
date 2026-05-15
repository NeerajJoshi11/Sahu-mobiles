import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Product model...");
  // @ts-ignore
  console.log("Product fields:", Object.keys(prisma.product.fields || {}));
  
  console.log("Checking ProductVariant model...");
  // @ts-ignore
  console.log("ProductVariant fields:", Object.keys(prisma.productVariant.fields || {}));
}

main().catch(console.error).finally(() => prisma.$disconnect());
