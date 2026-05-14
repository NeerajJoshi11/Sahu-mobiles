import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("admin_session");

  // Protect /admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // If it's the login route itself, allow it
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      // If already logged in, redirect away from login page
      if (sessionCookie && pathname === "/admin/login") {
        try {
          await jwtVerify(sessionCookie.value, JWT_SECRET);
          return NextResponse.redirect(new URL("/admin", request.url));
        } catch (e) {
          // Token invalid, continue to login page
        }
      }
      return NextResponse.next();
    }

    // Protect all other admin routes
    if (!sessionCookie) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Verify the JWT token
      await jwtVerify(sessionCookie.value, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
