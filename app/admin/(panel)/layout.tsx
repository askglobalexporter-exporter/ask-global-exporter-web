import { AdminShell } from "@/components/admin/AdminShell";
import { AdminQueryProvider } from "@/components/admin/AdminQueryProvider";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin();
  return <AdminQueryProvider><AdminToastProvider><AdminShell profile={profile} email={user.email ?? ""}>{children}</AdminShell></AdminToastProvider></AdminQueryProvider>;
}
