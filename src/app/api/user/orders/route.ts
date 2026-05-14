import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("customer_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user with their orders
    const userWithOrders = await prisma.user.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!userWithOrders) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ orders: userWithOrders.orders });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
