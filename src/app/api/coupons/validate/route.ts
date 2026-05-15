import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (cartTotal < coupon.minAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount for this coupon is ₹${coupon.minAmount.toLocaleString()}` 
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = Math.round(cartTotal * (coupon.value / 100));
    } else {
      discountAmount = coupon.value;
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountAmount,
      message: `${coupon.type === "PERCENTAGE" ? coupon.value + "%" : "₹" + coupon.value} discount applied!`
    });
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
