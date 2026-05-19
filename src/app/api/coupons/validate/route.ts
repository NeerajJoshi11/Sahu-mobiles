import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const brandKeywords: Record<string, string[]> = {
  "apple": ["apple", "iphone", "ipad", "macbook", "airpods", "watch"],
  "samsung": ["samsung", "galaxy"],
  "mi": ["mi", "redmi", "xiaomi", "poco"],
};

function getProductBrand(name: string, description: string = ""): string {
  const nameLower = name.toLowerCase();
  const descLower = description.toLowerCase();
  
  for (const [brand, keywords] of Object.entries(brandKeywords)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(nameLower) || regex.test(descLower)) {
        return brand;
      }
    }
  }
  
  const knownBrands = ["vivo", "oppo", "realme", "motorola", "mi"];
  for (const brand of knownBrands) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(nameLower) || regex.test(descLower)) {
      return brand;
    }
  }
  
  return "other";
}

export async function POST(request: Request) {
  try {
    const { code, cartTotal, items } = await request.json();
    
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

    // Determine coupon brand restrictions
    const restrictedBrands = coupon.applicableBrands
      ? coupon.applicableBrands.split(",").map((b: string) => b.trim().toLowerCase()).filter(Boolean)
      : [];

    let discountAmount = 0;

    if (restrictedBrands.length > 0) {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ 
          error: "Cart items are required to validate this restricted coupon." 
        }, { status: 400 });
      }

      // Filter products belonging to the allowed brands
      const applicableItems = items.filter(item => {
        const brand = getProductBrand(item.name, item.description || "");
        return restrictedBrands.includes(brand);
      });

      if (applicableItems.length === 0) {
        const brandNames = restrictedBrands.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(" or ");
        return NextResponse.json({ 
          error: coupon.description || `This coupon is only applicable to ${brandNames} products.` 
        }, { status: 400 });
      }

      // Calculate total only for allowed brand products
      const applicableSubtotal = applicableItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      if (applicableSubtotal < coupon.minAmount) {
        return NextResponse.json({ 
          error: `Minimum order amount of ₹${coupon.minAmount.toLocaleString()} is not met for applicable products.` 
        }, { status: 400 });
      }

      // Calculate discount solely on the applicable items
      if (coupon.type === "PERCENTAGE") {
        discountAmount = Math.round(applicableSubtotal * (coupon.value / 100));
      } else {
        discountAmount = Math.min(coupon.value, applicableSubtotal);
      }
    } else {
      // Generic coupon applicable to the whole cart
      if (cartTotal < coupon.minAmount) {
        return NextResponse.json({ 
          error: `Minimum order amount for this coupon is ₹${coupon.minAmount.toLocaleString()}` 
        }, { status: 400 });
      }

      if (coupon.type === "PERCENTAGE") {
        discountAmount = Math.round(cartTotal * (coupon.value / 100));
      } else {
        discountAmount = Math.min(coupon.value, cartTotal);
      }
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountAmount,
      description: coupon.description,
      message: `${coupon.type === "PERCENTAGE" ? coupon.value + "%" : "₹" + coupon.value} discount applied!`
    });
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
