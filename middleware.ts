import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/pricing",
    "/contact",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/check-email",
    "/api/auth",
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/projects",
    "/settings",
    "/api/upload",
    "/api/generate",
    "/api/replace-item",
    "/api/moodboard",
    "/api/shopping-list",
    "/api/razorpay",
  ];

  // Exclude webhook endpoint from protection (Razorpay calls this without auth)
  const isWebhookRoute = pathname === "/api/razorpay/verify-webhook";

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route)) && !isWebhookRoute;

  // Redirect to signin if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (pathname.startsWith("/auth/signin") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

