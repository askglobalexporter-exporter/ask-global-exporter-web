"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="admin-login-form">
      <label><span>Work email</span><input name="email" type="email" autoComplete="email" placeholder="name@company.com" required /></label>
      <label><span>Password</span><input name="password" type="password" autoComplete="current-password" placeholder="••••••••••••" minLength={8} required /></label>
      <Link href="/admin/forgot-password" style={{fontSize:9,color:"#53635c",textAlign:"right",marginTop:-10}}>Set or reset password</Link>
      {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}
      <button className="admin-primary-button" disabled={pending}>
        {pending ? <LoaderCircle className="admin-spin" size={17} /> : <LockKeyhole size={17} />}
        {pending ? "Signing in…" : "Sign in securely"}<ArrowRight size={17} />
      </button>
    </form>
  );
}
