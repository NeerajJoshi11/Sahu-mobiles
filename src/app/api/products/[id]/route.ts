import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
