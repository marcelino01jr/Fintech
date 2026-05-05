import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/transactions", "/budgets", "/profile"];
const authRoutes = ["/login", "/register", "/forgot-password", "/verify-otp"];
// reset-password is excluded from auth redirect (needed after OTP verification)

export default auth((req) => {
  const { nextUrl, auth: session } = req as typeof req & { auth: { user?: { id: string } } | null };
  const isProtected = protectedRoutes.some((r) => nextUrl.pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => nextUrl.pathname.startsWith(r));

  if (isProtected && !session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuth && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
