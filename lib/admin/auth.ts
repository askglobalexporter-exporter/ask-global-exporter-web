import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/env";
import { roleCan, type AdminPermission, type AdminProfile } from "./types";

export const getAdminSession = cache(async () => {
  if (!hasSupabaseBrowserConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id,full_name,role,is_active,last_seen_at,created_at,updated_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!profile) return null;
  return { user, profile: profile as AdminProfile, supabase };
});

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

export async function requireAdmin(permission: AdminPermission = "dashboard.read") {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleCan(session.profile.role, permission)) redirect("/admin?error=forbidden");
  return session;
}

export async function writeAudit(
  action: string,
  entityType: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
  currentSession?: AdminSession,
) {
  const session = currentSession ?? await getAdminSession();
  if (!session) return;
  await session.supabase.from("audit_logs").insert({ actor_id: session.user.id, action, entity_type: entityType, entity_id: entityId, metadata });
}
