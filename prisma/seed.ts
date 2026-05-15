import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create iPhone 17 Pro
  await prisma.product.upsert({
    where: { id: "seed-iphone-17-pro" },
    update: {}, // Don't overwrite if exists
    create: {
      id: "seed-iphone-17-pro",
      name: "iPhone 17 Pro",
      price: 129900,
      mrp: 139900,
      description: "The next generation of titanium. A19 Pro chip, advanced thermal management, and a new programmable Action Button.",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop",
      screen: "6.3\" Super Retina XDR",
      processor: "A19 Pro",
      ram: "8GB",
      storage: "128GB",
      category: "Smartphone",
      stock: 50,
      modelId: "iphone-17-pro",
      colorName: "Black Titanium",
      colorCode: "#2b2b2b",
      hasVariants: true,
      variants: {
        create: [
          { colorName: "Black Titanium", colorCode: "#2b2b2b", ram: "8GB", storage: "128GB", price: 129900, mrp: 139900, stock: 20 },
          { colorName: "Black Titanium", colorCode: "#2b2b2b", ram: "8GB", storage: "256GB", price: 139900, mrp: 149900, stock: 15 },
          { colorName: "Natural Titanium", colorCode: "#a7a196", ram: "8GB", storage: "128GB", price: 129900, mrp: 139900, stock: 10 },
          { colorName: "Natural Titanium", colorCode: "#a7a196", ram: "8GB", storage: "256GB", price: 139900, mrp: 149900, stock: 5 },
        ]
      }
    }
  });

  // Create Samsung S26 Ultra
  await prisma.product.upsert({
    where: { id: "seed-samsung-s26-ultra" },
    update: {},
    create: {
      id: "seed-samsung-s26-ultra",
      name: "Samsung Galaxy S26 Ultra",
      price: 124900,
      mrp: 144900,
      description: "Galaxy AI at its peak. 200MP camera, built-in S Pen, and the fastest chip in the Galaxy series.",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
      screen: "6.8\" Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 5",
      ram: "12GB",
      storage: "256GB",
      category: "Smartphone",
      stock: 40,
      modelId: "samsung-s26-ultra",
      colorName: "Titanium Gray",
      colorCode: "#8e8e93",
      hasVariants: true,
      variants: {
        create: [
          { colorName: "Titanium Gray", colorCode: "#8e8e93", ram: "12GB", storage: "256GB", price: 124900, mrp: 144900, stock: 20 },
          { colorName: "Titanium Gray", colorCode: "#8e8e93", ram: "12GB", storage: "512GB", price: 134900, mrp: 154900, stock: 10 },
          { colorName: "Titanium Black", colorCode: "#1c1c1c", ram: "12GB", storage: "256GB", price: 124900, mrp: 144900, stock: 10 },
        ]
      }
    }
  });

  // Create a default admin
  const hashedPassword = await bcrypt.hash("Testingit2341", 10);
  await prisma.admin.upsert({
    where: { username: "Mayank@Mobile" },
    update: { password: hashedPassword },
    create: {
      username: "Mayank@Mobile",
      password: hashedPassword,
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
