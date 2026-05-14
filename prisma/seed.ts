import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create initial products
  const products = [
    {
      name: "Aether Pro Max",
      price: 119900,
      description: "The ultimate flagship experience with a revolutionary titanium frame and next-gen camera system.",
      image: "/images/phone1.png",
      screen: "6.8\" OLED 120Hz",
      processor: "Aether Silicon M2",
      ram: "16GB",
      storage: "512GB",
      category: "Smartphone",
      stock: 10,
    },
    {
      name: "Aether Ultra 5G",
      price: 99900,
      description: "Incredible performance wrapped in a sleek metallic silver finish. Built for the modern creator.",
      image: "/images/phone2.png",
      screen: "6.7\" AMOLED",
      processor: "Aether Silicon M1",
      ram: "12GB",
      storage: "256GB",
      category: "Smartphone",
      stock: 15,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

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
