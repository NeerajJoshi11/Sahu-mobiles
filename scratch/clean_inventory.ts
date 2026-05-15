import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${products.length} products total.\n`);

  const seen = new Set<string>();
  const duplicates: string[] = [];

  products.forEach((p) => {
    // Create a key based on attributes that should be unique for a "distinct" listing
    const key = `${p.name}-${p.price}-${p.stock}-${p.colorName}-${p.ram}-${p.storage}`;
    
    if (seen.has(key)) {
      duplicates.push(p.id);
      console.log(`DUPLICATE FOUND: [${p.id}] ${p.name} - ₹${p.price} - ${p.colorName} (${p.stock} in stock)`);
    } else {
      seen.add(key);
      console.log(`KEEPING: [${p.id}] ${p.name} - ₹${p.price} - ${p.colorName} (${p.stock} in stock)`);
    }
  });

  if (duplicates.length > 0) {
    console.log(`\nDeleting ${duplicates.length} duplicate listings...`);
    const result = await prisma.product.deleteMany({
      where: {
        id: { in: duplicates }
      }
    });
    console.log(`Successfully deleted ${result.count} products.`);
  } else {
    console.log("\nNo duplicates found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
