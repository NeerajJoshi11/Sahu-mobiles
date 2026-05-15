import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Cleaning up duplicate products...")

  // Find all products
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' }
  })

  const seen = new Set()
  const toDelete = []

  for (const product of products) {
    // Group by name + modelId (if available) + colorName
    const key = `${product.name}-${product.modelId}-${product.colorName}`
    if (seen.has(key)) {
      toDelete.push(product.id)
    } else {
      seen.add(key)
    }
  }

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate products...`)
    await prisma.product.deleteMany({
      where: { id: { in: toDelete } }
    })
    console.log("Cleanup successful!")
  } else {
    console.log("No duplicates found.")
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
