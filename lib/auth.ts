import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db, users } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

const IDLE_TIMEOUT_MS  = 20 * 60 * 1000; // 20 menit
const MAX_SESSION_MS   = 60 * 60 * 1000; // 1 jam absolut

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: MAX_SESSION_MS / 1000, // 1 jam dalam detik
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // ── Single session: bump sessionVersion setiap login baru ──
        const newVersion = randomUUID();
        await db
          .update(users)
          .set({ sessionVersion: newVersion })
          .where(eq(users.id, user.id));

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          // custom fields — akan masuk ke JWT
          sessionVersion: newVersion,
          loginAt: Date.now(),
          lastActivity: Date.now(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First sign in — set semua fields
        token.id = user.id;
        token.name = user.name;
        token.sessionVersion = (user as any).sessionVersion;
        token.loginAt = (user as any).loginAt;
        token.lastActivity = (user as any).lastActivity;
        return token;
      }

      // Subsequent requests — cek idle timeout
      const now = Date.now();
      const lastActivity = (token.lastActivity as number) ?? now;
      const loginAt = (token.loginAt as number) ?? now;

      // Cek idle timeout (20 menit tidak ada aktivitas)
      if (now - lastActivity > IDLE_TIMEOUT_MS) {
        return { ...token, expired: true };
      }

      // Cek max session (1 jam absolut)
      if (now - loginAt > MAX_SESSION_MS) {
        return { ...token, expired: true };
      }

      // Update lastActivity
      token.lastActivity = now;
      return token;
    },

    async session({ session, token }) {
      if (token.expired) {
        // Session expired — return empty session
        return { ...session, user: undefined as any, expired: true };
      }

      session.user.id = token.id as string;
      session.user.name = token.name;
      (session as any).sessionVersion = token.sessionVersion;
      (session as any).loginAt = token.loginAt;
      return session;
    },
  },
});
