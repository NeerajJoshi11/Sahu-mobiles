import { prisma } from "../src/lib/prisma";

async function run() {
  const products = await prisma.product.findMany();
  
  // First, clear any existing variants just in case
  await prisma.productVariant.deleteMany();
  
  for (const product of products) {
    if (product.modelId === "iphone-17-pro-max") {
      await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            ram: "8GB",
            storage: "256GB",
            colorName: "Natural Titanium",
            colorCode: "#b5b0a1",
            price: 159900,
            mrp: 169900,
            stock: 35
          },
          {
            productId: product.id,
            ram: "8GB",
            storage: "512GB",
            colorName: "Desert Titanium",
            colorCode: "#cd9963",
            price: 179900,
            mrp: 189900,
            stock: 20
          }
        ]
      });
    } else if (product.modelId === "samsung-s26-ultra") {
       await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            ram: "12GB",
            storage: "512GB",
            colorName: "Titanium Gray",
            colorCode: "#5e5e5e",
            price: 134900,
            mrp: 144900,
            stock: 40
          },
          {
            productId: product.id,
            ram: "16GB",
            storage: "1TB",
            colorName: "Titanium Black",
            colorCode: "#000000",
            price: 154900,
            mrp: 164900,
            stock: 15
          }
        ]
      });
    } else if (product.modelId === "iphone-17-pro") {
       await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            ram: "8GB",
            storage: "128GB",
            colorName: "Black Titanium",
            colorCode: "#2b2b2b",
            price: 139900,
            mrp: 144900,
            stock: 50
          },
          {
            productId: product.id,
            ram: "8GB",
            storage: "256GB",
            colorName: "White Titanium",
            colorCode: "#f3f3f3",
            price: 149900,
            mrp: 154900,
            stock: 30
          }
        ]
      });
    } else if (product.modelId === "samsung-s26-plus") {
      await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            ram: "12GB",
            storage: "256GB",
            colorName: "Cobalt Blue",
            colorCode: "#2a3b5c",
            price: 99900,
            mrp: 104900,
            stock: 60
          },
          {
            productId: product.id,
            ram: "12GB",
            storage: "512GB",
            colorName: "Onyx Black",
            colorCode: "#1c1c1c",
            price: 109900,
            mrp: 114900,
            stock: 25
          }
        ]
      });
    }
  }
  
  console.log("Successfully attached variants to the premium phones!");
}

run().catch(console.error);
