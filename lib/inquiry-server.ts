import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

const attempts = new Map<string, number>();
function memoryRateLimited(key: string) {
  const now = Date.now(); const last = attempts.get(key) || 0;
  if (now - last < 30_000) return true;
  attempts.set(key, now); return false;
}
export async function isRateLimited(scope: "quote" | "sample", ip: string) {
  const key = createHash("sha256").update(`${scope}:${ip}`).digest("hex");
  const supabase = getSupabaseAdmin();
  if (!supabase) return memoryRateLimited(key);
  const { data, error } = await supabase.rpc("consume_inquiry_rate_limit", {
    p_key: key,
    p_limit: 3,
    p_window_seconds: 900,
  });
  if (error) {
    console.error("Durable inquiry rate limit unavailable", error.message);
    return memoryRateLimited(key);
  }
  return data === false;
}
export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
export function inquiryReference(prefix: "RFQ" | "SMP") {
  const date = new Date().toISOString().slice(0,10).replaceAll("-", "");
  return `ASK-${prefix}-${date}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
}
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
