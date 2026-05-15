import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const products = await request.json(); // Expects an array of product objects with nested variants

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array." }, { status: 400 });
    }

    const results = await prisma.$transaction(async (tx) => {
      const processed = [];
      
      for (const p of products) {
        const { variants, id, ...productData } = p;
        
        if (id) {
          const res = await tx.product.upsert({
            where: { id },
            update: {
              ...productData,
              variants: variants && variants.length > 0 ? {
                deleteMany: {},
                create: variants.map((v: any) => ({
                  ram: String(v.ram),
                  storage: String(v.storage),
                  colorName: v.colorName || null,
                  colorCode: v.colorCode || null,
                  image: v.image || null,
                  price: parseFloat(v.price),
                  mrp: v.mrp ? parseFloat(v.mrp) : null,
                  stock: parseInt(v.stock) || 0
                }))
              } : undefined
            },
            create: {
              ...productData,
              variants: variants && variants.length > 0 ? {
                create: variants.map((v: any) => ({
                  ram: String(v.ram),
                  storage: String(v.storage),
                  colorName: v.colorName || null,
                  colorCode: v.colorCode || null,
                  image: v.image || null,
                  price: parseFloat(v.price),
                  mrp: v.mrp ? parseFloat(v.mrp) : null,
                  stock: parseInt(v.stock) || 0
                }))
              } : undefined
            }
          });
          processed.push(res);
        } else {
          // Check for existing product by Name and Color to prevent duplicates
          const existing = await tx.product.findFirst({
            where: {
              name: productData.name,
              colorName: productData.colorName || null,
              modelId: productData.modelId || null,
            }
          });

          if (existing) {
            const res = await tx.product.update({
              where: { id: existing.id },
              data: {
                ...productData,
                variants: variants && variants.length > 0 ? {
                  deleteMany: {},
                  create: variants.map((v: any) => ({
                    ram: String(v.ram),
                    storage: String(v.storage),
                    colorName: v.colorName || null,
                    colorCode: v.colorCode || null,
                    image: v.image || null,
                    price: parseFloat(v.price),
                    mrp: v.mrp ? parseFloat(v.mrp) : null,
                    stock: parseInt(v.stock) || 0
                  }))
                } : undefined
              }
            });
            processed.push(res);
          } else {
            const res = await tx.product.create({
              data: {
                ...productData,
                variants: variants && variants.length > 0 ? {
                  create: variants.map((v: any) => ({
                    ram: String(v.ram),
                    storage: String(v.storage),
                    colorName: v.colorName || null,
                    colorCode: v.colorCode || null,
                    image: v.image || null,
                    price: parseFloat(v.price),
                    mrp: v.mrp ? parseFloat(v.mrp) : null,
                    stock: parseInt(v.stock) || 0
                  }))
                } : undefined
              }
            });
            processed.push(res);
          }
        }
      }
      return processed;
    });

    return NextResponse.json({ 
      message: `Successfully processed ${results.length} products.`,
      count: results.length 
    });
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ error: "Failed to process bulk import: " + error.message }, { status: 500 });
  }
}
