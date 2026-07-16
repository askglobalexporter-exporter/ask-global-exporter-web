import { UpdatePasswordForm } from "@/components/admin/PasswordResetForm";

export const dynamic = "force-dynamic";
export default function UpdatePasswordPage() { return <main className="admin-login-page"><section className="admin-login-brand"><div className="admin-login-logo"><span>ASK</span><small>GLOBAL</small></div><div><p className="admin-kicker">Protected workspace</p><h1>Create a strong password.</h1><p>Your session is verified. Choose a unique password with at least ten characters to finish account setup.</p></div><span /></section><section className="admin-login-panel"><div className="admin-login-card"><div className="admin-login-card-head"><span>AG</span><div><h2>New password</h2><p>Complete administrator setup</p></div></div><UpdatePasswordForm /></div></section></main>; }
