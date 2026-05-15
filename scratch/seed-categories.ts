import { prisma } from "../src/lib/prisma";

async function run() {
  const products = [
    {
      name: "iPad Pro 13-inch (M4)",
      price: 129900,
      mrp: 139900,
      description: "The ultimate iPad experience with the incredibly fast M4 chip, stunning Ultra Retina XDR display, and all-day battery life.",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2027&auto=format&fit=crop",
      screen: "13\" Ultra Retina XDR",
      processor: "Apple M4",
      ram: "8GB",
      storage: "256GB",
      category: "Tablet",
      stock: 20,
      modelId: "ipad-pro-13-m4",
      colorName: "Space Black",
      colorCode: "#2e2e2e",
      hasVariants: false,
    },
    {
      name: "Samsung Galaxy Tab S10 Ultra",
      price: 108900,
      mrp: 119900,
      description: "Massive 14.6\" Dynamic AMOLED 2X display, S Pen included, and powerful performance for work and play.",
      image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1984&auto=format&fit=crop",
      screen: "14.6\" Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "512GB",
      category: "Tablet",
      stock: 15,
      modelId: "galaxy-tab-s10-ultra",
      colorName: "Graphite",
      colorCode: "#3b3b3b",
      hasVariants: false,
    },
    {
      name: "AirPods Pro (2nd Gen)",
      price: 24900,
      mrp: 26900,
      description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.",
      image: "https://images.unsplash.com/photo-1606220588913-b3aecb48a1a4?q=80&w=2070&auto=format&fit=crop",
      screen: "N/A",
      processor: "Apple H2",
      ram: "N/A",
      storage: "N/A",
      category: "Audio",
      stock: 100,
      modelId: "airpods-pro-2",
      colorName: "White",
      colorCode: "#ffffff",
      hasVariants: false,
    },
    {
      name: "Sony WH-1000XM6",
      price: 29900,
      mrp: 34900,
      description: "Industry-leading noise cancellation, exceptional sound quality, and all-day comfort.",
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1888&auto=format&fit=crop",
      screen: "N/A",
      processor: "Sony V3",
      ram: "N/A",
      storage: "N/A",
      category: "Audio",
      stock: 45,
      modelId: "sony-wh-1000xm6",
      colorName: "Black",
      colorCode: "#000000",
      hasVariants: false,
    }
  ];

  console.log("Seeding tablets and audio...");
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("Successfully added new categories.");
}

run().catch(console.error);
