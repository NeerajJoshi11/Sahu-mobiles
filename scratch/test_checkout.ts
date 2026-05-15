import { prisma } from "../src/lib/prisma";

async function test() {
  try {
    console.log("Attempting to create a test order...");
    
    // Get a real product ID first to avoid foreign key errors
    const product = await prisma.product.findFirst();
    if (!product) {
      console.error("No products found in DB to test with!");
      return;
    }

    const order = await prisma.order.create({
      data: {
        customerName: "Test User",
        customerEmail: "test@example.com",
        customerPhone: "9876543210",
        address: "123 Test St, Lucknow, UP",
        pincode: "226001",
        total: product.price,
        paymentMethod: "COD",
        paymentStatus: "COD",
        status: "PENDING",
        deliveryMethod: "STANDARD",
        items: {
          create: [{
            productId: product.id,
            quantity: 1,
            price: product.price,
            selectedColor: "Black",
            selectedVariant: "8GB/128GB"
          }]
        }
      }
    });

    console.log("Success! Order created with ID:", order.id);
  } catch (error: any) {
    console.error("DATABASE ERROR:", error.message);
    if (error.code) console.error("Error Code:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();
