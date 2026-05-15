import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("customer_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax"
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}
