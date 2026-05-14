import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { deliveryBoyName, status } = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: {
        deliveryBoyName,
        status: status || "OUT_FOR_DELIVERY",
        assignedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update Delivery Error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery info" },
      { status: 500 }
    );
  }
}
