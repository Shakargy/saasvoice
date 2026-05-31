import { toast } from "sonner";

type ApiResult<T> = { ok: boolean; status: number; data: T | null };

/**
 * Fetch JSON without ever throwing on an empty/invalid body. On a 401 (session
 * expired or user no longer exists) it shows a toast and bounces to login.
 */
export async function apiFetch<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const res = await fetch(input, init);

  let data: T | null = null;
  try {
    const text = await res.text();
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }

  if (res.status === 401) {
    toast.error("Your session expired. Please sign in again.");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return { ok: res.ok, status: res.status, data };
}

/** Convenience JSON POST/PATCH/DELETE helper. */
export function apiSend<T = unknown>(
  input: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
) {
  return apiFetch<T>(input, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}
