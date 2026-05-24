import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const products = await request.json(); // Expects an array of product objects with nested variants

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array." }, { status: 400 });
    }

    const processed = [];
    const chunkSize = 20;

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      
      const chunkResults = await Promise.all(chunk.map(async (p) => {
        const { variants, id, ...rawProductData } = p;
        
        // Normalize empty strings to null to match Prisma's expected optional fields
        const productData = {
          ...rawProductData,
          colorName: rawProductData.colorName || null,
          colorCode: rawProductData.colorCode || null,
        };
        
        if (id) {
          const res = await prisma.product.upsert({
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
          return res;
        } else {
          // Check for existing product by Name and Color to prevent duplicates
          const existing = await prisma.product.findFirst({
            where: {
              name: productData.name,
              colorName: productData.colorName || null,
              modelId: productData.modelId || null,
            }
          });

          if (existing) {
            const res = await prisma.product.update({
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
            return res;
          } else {
            const res = await prisma.product.create({
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
            return res;
          }
        }
      }));
      
      processed.push(...chunkResults);
    }

    return NextResponse.json({ 
      message: `Successfully processed ${processed.length} products.`,
      count: processed.length 
    });
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ error: "Failed to process bulk import: " + error.message }, { status: 500 });
  }
}
