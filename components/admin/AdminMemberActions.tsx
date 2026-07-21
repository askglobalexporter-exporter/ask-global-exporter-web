"use client";

import { useState, useTransition } from "react";
import { KeyRound, LoaderCircle, Trash2 } from "lucide-react";
import { deleteAdminMutation, resendAdminPasswordMutation } from "@/app/admin/actions";
import { useAdminToast } from "./AdminToast";

export function AdminMemberActions({ userId, fullName, isCurrentUser }: { userId:string;fullName:string;isCurrentUser:boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const { notify } = useAdminToast();

  function resend() {
    setMessage("");
    startTransition(async () => {
      try { await resendAdminPasswordMutation({ userId }); setMessage("Link pembuatan password telah dikirim ulang."); notify("success", "Link pembuatan password berhasil dikirim."); }
      catch (error) { const text = error instanceof Error ? error.message : "Link gagal dikirim."; setMessage(text); notify("error", text); }
    });
  }

  function remove() {
    if (!window.confirm(`Hapus administrator ${fullName}? Akses loginnya akan dicabut permanen.`)) return;
    setMessage("");
    startTransition(async () => {
      try { await deleteAdminMutation({ userId }); notify("success", "Administrator berhasil dihapus."); }
      catch (error) { const text = error instanceof Error ? error.message : "Administrator gagal dihapus."; setMessage(text); notify("error", text); }
    });
  }

  return <div className="admin-member-actions">
    <button type="button" className="admin-secondary-button" disabled={pending} onClick={resend}>{pending ? <LoaderCircle className="admin-spin" size={14}/> : <KeyRound size={14}/>} Kirim link password</button>
    <button type="button" className="admin-danger-button" disabled={pending || isCurrentUser} title={isCurrentUser ? "Akun yang sedang digunakan tidak dapat dihapus" : undefined} onClick={remove}><Trash2 size={14}/> Hapus admin</button>
    {message && <p className="admin-member-message">{message}</p>}
  </div>;
}
