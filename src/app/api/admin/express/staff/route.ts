import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const staff = await prisma.deliveryBoy.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ staff });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await request.json();

    const boy = await prisma.deliveryBoy.create({
      data: { name, phone },
    });

    return NextResponse.json({ boy });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add staff" }, { status: 500 });
  }
}
