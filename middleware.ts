import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Middleware pakai authConfig saja — aman untuk Edge Runtime (tidak import pg/db)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
