import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Next 16 renamed the `middleware` convention to `proxy`. This runs the
// edge-safe NextAuth instance (no Prisma/bcrypt) to protect routes.
export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  // Run on everything except static assets and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
