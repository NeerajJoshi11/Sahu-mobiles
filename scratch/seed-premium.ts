import { prisma } from "../src/lib/prisma";

async function run() {
  const products = [
    {
      name: "Samsung Galaxy S26 Ultra",
      price: 134900,
      mrp: 144900,
      description: "Galaxy AI at its peak. 200MP camera, built-in S Pen, and the fastest Snapdragon chip in the Galaxy series.",
      image: "https://m.media-amazon.com/images/I/71OIX4hJO5L._SL1500_.jpg",
      screen: "6.8\" Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 4",
      ram: "12GB",
      storage: "512GB",
      category: "Smartphone",
      stock: 40,
      modelId: "samsung-s26-ultra",
      colorName: "Titanium Gray",
      colorCode: "#5e5e5e",
      hasVariants: true,
    },
    {
      name: "Samsung Galaxy S26+",
      price: 99900,
      mrp: 104900,
      description: "Pro-grade camera and epic performance in a refined design. The perfect balance of power and style.",
      image: "https://m.media-amazon.com/images/I/71MHTD3uL4L._SX679_.jpg",
      screen: "6.7\" Dynamic AMOLED 2X",
      processor: "Exynos 2500",
      ram: "12GB",
      storage: "256GB",
      category: "Smartphone",
      stock: 60,
      modelId: "samsung-s26-plus",
      colorName: "Cobalt Blue",
      colorCode: "#2a3b5c",
      hasVariants: true,
    },
    {
      name: "iPhone 17 Pro Max",
      price: 159900,
      mrp: 169900,
      description: "The ultimate iPhone experience. Massive 6.9\" display, A19 Pro chip, and advanced thermal management.",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop",
      screen: "6.9\" Super Retina XDR",
      processor: "A19 Pro",
      ram: "8GB",
      storage: "256GB",
      category: "Smartphone",
      stock: 35,
      modelId: "iphone-17-pro-max",
      colorName: "Natural Titanium",
      colorCode: "#b5b0a1",
      hasVariants: true,
    },
    {
      name: "iPhone 17 Pro",
      price: 139900,
      mrp: 144900,
      description: "Pro power in a perfect size. Features the new programmable Action Button and aerospace-grade titanium.",
      image: "https://images.unsplash.com/photo-1696446700022-27101859c878?q=80&w=2070&auto=format&fit=crop",
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
    }
  ];

  console.log("Seeding premium phones...");
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("Successfully added 4 premium sample phones.");
}

run().catch(console.error);
