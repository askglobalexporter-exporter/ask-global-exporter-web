import Link from "next/link";
import { RequestPasswordResetForm } from "@/components/admin/PasswordResetForm";
import { BrandLogo } from "@/components/BrandLogo";

export const dynamic = "force-dynamic";
export default function ForgotPasswordPage() { return <main className="admin-login-page"><section className="admin-login-brand"><Link href="/" className="admin-login-logo"><BrandLogo /></Link><div><p className="admin-kicker">Secure account recovery</p><h1>Return to your workspace.</h1><p>We will send a one-time secure link to the administrator email registered in Supabase.</p></div><span /></section><section className="admin-login-panel"><div className="admin-login-card"><div className="admin-login-card-head"><span>AG</span><div><h2>Set your password</h2><p>Invitation and account recovery</p></div></div><RequestPasswordResetForm /><Link href="/admin/login" className="admin-back-link" style={{marginTop:20}}>← Back to sign in</Link></div></section></main>; }
