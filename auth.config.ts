import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config — no Prisma/bcrypt imports, so the middleware
 * can run it. The Credentials provider is added in auth.ts (Node-only).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      if (typeof token.phone === "string") session.user.phone = token.phone;
      return session;
    },
  },
} satisfies NextAuthConfig;
