import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (!product) {
      // Try finding by modelId (slug)
      product = await prisma.product.findFirst({
        where: { modelId: id },
        include: { variants: true }
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Attempting to delete product with ID:", id);
    
    // Check if product exists first
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      console.log("Product not found");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });
    console.log("Successfully deleted product");
    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    console.error("Deletion error:", error);
    
    // Handle Prisma Foreign Key constraint errors gracefully
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: "Cannot delete this product because it has been ordered. Try setting its stock to 0 instead." 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to delete product: " + error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { variants, ...productData } = await request.json();
    
    // Update product and variants
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: {
          deleteMany: {}, // Clear existing variants
          create: variants && variants.length > 0 ? variants.map((v: any) => ({
            ram: v.ram,
            storage: v.storage,
            colorName: v.colorName || null,
            colorCode: v.colorCode || null,
            image: v.image || null,
            price: parseFloat(v.price),
            mrp: v.mrp ? parseFloat(v.mrp) : null,
            stock: parseInt(v.stock)
          })) : []
        }
      },
      include: { variants: true }
    });
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update product: " + error.message }, { status: 500 });
  }
}
