import { createClient } from "@supabase/supabase-js";

const attempts = new Map<string, number>();
export function isRateLimited(ip: string) {
  const now = Date.now(); const last = attempts.get(ip) || 0;
  if (now - last < 30_000) return true;
  attempts.set(ip, now); return false;
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
