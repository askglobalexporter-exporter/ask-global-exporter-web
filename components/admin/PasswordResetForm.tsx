"use client";

import { useActionState, useState } from "react";
import { ArrowRight, KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { requestPasswordResetAction, type PasswordState } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const initialState: PasswordState = {};

export function RequestPasswordResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);
  return <form action={action} className="admin-login-form"><label><span>Administrator email</span><input name="email" type="email" autoComplete="email" required /></label>{state.error && <p className="admin-form-error">{state.error}</p>}{state.success && <p className="admin-toast">{state.success}</p>}<button className="admin-primary-button" disabled={pending}>{pending ? <LoaderCircle className="admin-spin" size={17} /> : <KeyRound size={17} />}{pending ? "Sending…" : "Send secure link"}<ArrowRight size={17} /></button></form>;
}

export function UpdatePasswordForm() {
  const router = useRouter(); const [error,setError] = useState(""); const [pending,setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(""); const form = new FormData(event.currentTarget); const password = String(form.get("password") ?? ""); const confirm = String(form.get("confirm") ?? ""); if (password.length < 10) { setError("Use at least 10 characters."); setPending(false); return; } if (password !== confirm) { setError("Passwords do not match."); setPending(false); return; } const supabase = createSupabaseBrowserClient(); const { error:updateError } = await supabase.auth.updateUser({ password }); if (updateError) { setError(updateError.message); setPending(false); return; } router.replace("/admin?notice=password-updated"); }
  return <form onSubmit={submit} className="admin-login-form"><label><span>New password</span><input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label><span>Confirm password</span><input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label>{error && <p className="admin-form-error">{error}</p>}<button className="admin-primary-button" disabled={pending}>{pending ? <LoaderCircle className="admin-spin" size={17} /> : <KeyRound size={17} />}{pending ? "Saving…" : "Create password"}<ArrowRight size={17} /></button></form>;
}
