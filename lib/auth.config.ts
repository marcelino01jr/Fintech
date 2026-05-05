import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const session = auth as any;
      const isLoggedIn = !!session?.user && !session?.expired;

      const protectedRoutes = ["/dashboard", "/transactions", "/budgets", "/profile"];
      const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

      const isProtected = protectedRoutes.some((r) => nextUrl.pathname.startsWith(r));
      const isAuth = authRoutes.some((r) => nextUrl.pathname.startsWith(r));

      if (isProtected && !isLoggedIn) {
        const url = new URL("/login", nextUrl);
        // Tambah reason kalau session expired
        if (session?.expired) url.searchParams.set("message", "Sesi Anda telah berakhir. Silakan masuk kembali.");
        return Response.redirect(url);
      }
      if (isAuth && isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));

      return true;
    },
  },
};
