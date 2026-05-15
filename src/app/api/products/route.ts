import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");

    const products = await prisma.product.findMany({
      where: modelId ? { modelId } : {},
      orderBy: { createdAt: "desc" },
      include: { variants: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { variants, ...productData } = await request.json();
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            ram: v.ram,
            storage: v.storage,
            colorName: v.colorName || null,
            colorCode: v.colorCode || null,
            image: v.image || null,
            price: parseFloat(v.price),
            mrp: v.mrp ? parseFloat(v.mrp) : null,
            stock: parseInt(v.stock)
          }))
        } : undefined
      },
      include: { variants: true }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
