import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Thrown when there is no valid session, or the session user no longer exists. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/**
 * Returns the current user's id, verifying the user still exists in the DB.
 * (A valid JWT can outlive its user — e.g. account deleted — which would
 * otherwise cause foreign-key failures deep in a handler.)
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new UnauthorizedError();

  const exists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!exists) throw new UnauthorizedError();

  return userId;
}

/** Parse a JSON request body, returning null instead of throwing on bad input. */
export async function readJson<T = unknown>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Wraps a route handler so every code path returns JSON — including unexpected
 * errors (which otherwise produce an empty body that crashes `res.json()` on
 * the client). UnauthorizedError maps to 401.
 */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.error("[api] unhandled error:", err);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
