import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      email, 
      firstName, 
      lastName, 
      address, 
      city, 
      state, 
      pincode, 
      phone, 
      items, 
      total, 
      paymentMethod,
      deliveryMethod 
    } = data;

    // 1. Get User Session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("customer_session")?.value;

    // 1. Validation
    if (!email || !firstName || !lastName || !address || !city || !state || !pincode || !phone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 2. Create Order
    const order = await prisma.order.create({
      data: {
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        address: `${address}, ${city}, ${state}`,
        pincode: pincode,
        total: total,
        paymentMethod: paymentMethod || "WHATSAPP",
        paymentStatus: paymentMethod === "COD" ? "COD" : "PENDING",
        status: "PENDING",
        deliveryMethod: deliveryMethod || "STANDARD",
        fulfillmentProvider: deliveryMethod === "EXPRESS" ? "SAHU_LOCAL" : "SHIPROCKET",
        userId: sessionId || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor || null,
            selectedVariant: item.selectedVariant || null,
          })),
        },
      },
    });

    // 3. Return Success
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: "Order placed successfully" 
    });

  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ 
      error: "Failed to place order", 
      details: error.message 
    }, { status: 500 });
  }
}
