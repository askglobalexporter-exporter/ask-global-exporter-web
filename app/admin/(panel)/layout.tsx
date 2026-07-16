import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin();
  return <AdminShell profile={profile} email={user.email ?? ""}>{children}</AdminShell>;
}
