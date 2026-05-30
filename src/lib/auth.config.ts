import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config. No Prisma, no bcrypt — so it can be imported by
 * the middleware (which runs on the edge runtime). The Credentials provider,
 * which needs the database, is added in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isOnDashboard) {
        // Unauthenticated users are sent to the sign-in page.
        return isLoggedIn;
      }

      if (isOnAuthPage && isLoggedIn) {
        // Logged-in users should not see login/register.
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
