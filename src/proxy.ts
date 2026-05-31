import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Next 16 renamed the `middleware` convention to `proxy`. The build requires a
// statically-detectable function export named `proxy`, so we wrap NextAuth's
// handler rather than re-exporting the destructured value.
const { auth } = NextAuth(authConfig);

export function proxy(request: NextRequest) {
  // `auth` is a higher-order handler; invoke it as the proxy with no extra
  // logic so the edge-safe authorized() callback in authConfig does the work.
  return (auth as unknown as (req: NextRequest) => Response | Promise<Response>)(
    request
  );
}

export const config = {
  // Run on everything except static assets and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
