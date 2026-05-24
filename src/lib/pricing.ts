import { prisma } from "./prisma";

export const brandKeywords: Record<string, string[]> = {
  "apple": ["apple", "iphone", "ipad", "macbook", "airpods", "watch"],
  "samsung": ["samsung", "galaxy"],
  "mi": ["mi", "redmi", "xiaomi", "poco"],
};

export function getProductBrand(name: string, description: string = ""): string {
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

interface ValidateItemInput {
  id: string;
  quantity: number;
  selectedVariant?: string | null;
  selectedColor?: string | null;
}

export async function validateAndCalculateTotal(
  items: ValidateItemInput[],
  couponCode?: string | null
) {
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.id },
      include: { variants: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${item.id}`);
    }

    let itemPrice = product.price;

    if (product.hasVariants && item.selectedVariant) {
      const parts = item.selectedVariant.split("/").map(s => s.trim());
      if (parts.length === 2) {
        const [ram, storage] = parts;
        const matchingVariant = product.variants.find(
          (v: any) => v.ram.toLowerCase() === ram.toLowerCase() && v.storage.toLowerCase() === storage.toLowerCase()
        );
        if (matchingVariant) {
          itemPrice = matchingVariant.price;
        } else {
          throw new Error(`Variant not found for product ${product.name}: ${item.selectedVariant}`);
        }
      } else {
        throw new Error(`Invalid variant format: ${item.selectedVariant}`);
      }
    }

    subtotal += itemPrice * item.quantity;
    verifiedItems.push({
      ...item,
      name: product.name,
      description: product.description || "",
      price: itemPrice,
    });
  }

  let discount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (!coupon) {
      throw new Error("Invalid coupon code");
    }

    if (!coupon.isActive) {
      throw new Error("This coupon is no longer active");
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error("This coupon has expired");
    }

    const restrictedBrands = coupon.applicableBrands
      ? coupon.applicableBrands.split(",").map((b: string) => b.trim().toLowerCase()).filter(Boolean)
      : [];

    if (restrictedBrands.length > 0) {
      // Filter items matching the coupon brands
      const applicableItems = verifiedItems.filter(item => {
        const brand = getProductBrand(item.name, item.description);
        return restrictedBrands.includes(brand);
      });

      if (applicableItems.length === 0) {
        throw new Error(coupon.description || "This coupon is not applicable to any products in your cart.");
      }

      const applicableSubtotal = applicableItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (applicableSubtotal < coupon.minAmount) {
        throw new Error(`Minimum order amount of ₹${coupon.minAmount.toLocaleString()} is not met for applicable products.`);
      }

      if (coupon.type === "PERCENTAGE") {
        discount = Math.round(applicableSubtotal * (coupon.value / 100));
      } else {
        discount = Math.min(coupon.value, applicableSubtotal);
      }
    } else {
      if (subtotal < coupon.minAmount) {
        throw new Error(`Minimum order amount for this coupon is ₹${coupon.minAmount.toLocaleString()}`);
      }

      if (coupon.type === "PERCENTAGE") {
        discount = Math.round(subtotal * (coupon.value / 100));
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
    }
  }

  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    verifiedItems,
  };
}
