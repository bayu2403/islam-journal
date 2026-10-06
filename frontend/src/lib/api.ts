"use client";

import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Client-side TTL cache (Redis alternative, browser edition).
// Only for near-static GETs; mutations call invalidate().
const clientCache = new Map<string, { value: unknown; expiresAt: number }>();

export function invalidate(prefix: string) {
  for (const key of clientCache.keys()) if (key.startsWith(prefix)) clientCache.delete(key);
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  cacheTtlMs = 0,
): Promise<T> {
  const cacheKey = `${init.method ?? "GET"}:${path}`;
  if (cacheTtlMs > 0) {
    const hit = clientCache.get(cacheKey);
    if (hit && Date.now() < hit.expiresAt) return hit.value as T;
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? `Request failed (${res.status})`);

  if (cacheTtlMs > 0) clientCache.set(cacheKey, { value: body, expiresAt: Date.now() + cacheTtlMs });
  return body as T;
}

// Local-date helpers (server is timezone-agnostic; client owns "today")
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const todayDow = () => new Date().getDay();
