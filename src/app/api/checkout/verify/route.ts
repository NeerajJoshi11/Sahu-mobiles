import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

    // Verify signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    // DEMO MODE BYPASS: Allow success if payment ID is "test_payment" (Only in development/staging)
    const isTestMode = 
      process.env.NODE_ENV !== "production" && 
      razorpay_payment_id === "test_payment";

    if (!isTestMode && generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment is verified, create order in database
    const cookieStore = await cookies();
    const userId = cookieStore.get("customer_session")?.value;

    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        customerName: `${orderDetails.firstName} ${orderDetails.lastName}`,
        customerEmail: orderDetails.email,
        customerPhone: orderDetails.phone || "N/A",
        address: `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state}`,
        pincode: orderDetails.pincode,
        total: orderDetails.total,
        status: "COMPLETED",
        deliveryMethod: orderDetails.deliveryMethod || "STANDARD",
        fulfillmentProvider: orderDetails.deliveryMethod === "EXPRESS" ? "SAHU_LOCAL" : "SHIPROCKET",
        items: {
          create: orderDetails.items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor || null,
            selectedVariant: item.selectedVariant || null,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
