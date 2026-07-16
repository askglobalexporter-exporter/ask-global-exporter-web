import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <main className="admin-login-page">
      <section className="admin-login-brand">
        <Link href="/" className="admin-login-logo"><span>ASK</span><small>GLOBAL</small></Link>
        <div>
          <p className="admin-kicker">Enterprise workspace</p>
          <h1>Trade operations,<br />under control.</h1>
          <p>Manage export content, products, buyer inquiries, media, and commercial performance from one secure workspace.</p>
        </div>
        <div className="admin-login-trust"><ShieldCheck size={18} /><span>Protected by Supabase Auth and database-level access policies</span></div>
      </section>
      <section className="admin-login-panel">
        <div className="admin-login-card">
          <div className="admin-login-card-head"><span>AG</span><div><h2>Welcome back</h2><p>Sign in to Ask Global Admin</p></div></div>
          <LoginForm />
          <p className="admin-login-help">Access is invitation-only. Contact your Super Admin if your account is not active.</p>
          <Link href="/" className="admin-back-link">← Return to website</Link>
        </div>
      </section>
    </main>
  );
}
