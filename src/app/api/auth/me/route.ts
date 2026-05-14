import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("customer_session")?.value;

  if (!sessionId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ user });
}
