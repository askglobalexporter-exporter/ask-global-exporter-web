"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

type ToastType = "success" | "error" | "info";
type ToastContextValue = { notify:(type:ToastType, message:string)=>void };
const ToastContext = createContext<ToastContextValue | null>(null);

const noticeMessages:Record<string,string> = {
  "password-updated":"Password berhasil dibuat. Anda sudah masuk ke panel admin.",
  "content-deleted":"Konten berhasil dihapus.",
  "slide-deleted":"Slide berhasil dihapus.",
};

export function AdminToastProvider({ children }: { children:React.ReactNode }) {
  const [toast, setToast] = useState<{type:ToastType;message:string}|null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenNotice = useRef("");
  const searchParams = useSearchParams();

  const notify = useCallback((type:ToastType, message:string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ type, message });
    if (type !== "info") timer.current = setTimeout(()=>setToast(null), 5000);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const notice = searchParams.get("notice") ?? "";
    const saved = searchParams.get("saved") ?? "";
    const key = `${notice}:${saved}`;
    if (key === ":" || seenNotice.current === key) return;
    seenNotice.current = key;
    const message = noticeMessages[notice] ?? (saved ? (saved === "created" ? "Data baru berhasil dibuat." : "Perubahan berhasil disimpan.") : "");
    if (!message) return;
    const noticeTimer = setTimeout(()=>notify("success", message), 0);
    return () => clearTimeout(noticeTimer);
  }, [notify, searchParams]);

  const Icon = toast?.type === "success" ? CheckCircle2 : toast?.type === "error" ? AlertCircle : Info;
  return <ToastContext.Provider value={{ notify }}>
    {children}
    {toast && <div className={`admin-global-toast ${toast.type}`} role="status" aria-live="polite"><Icon size={19}/><span>{toast.message}</span><button type="button" aria-label="Tutup notifikasi" onClick={()=>setToast(null)}><X size={15}/></button></div>}
  </ToastContext.Provider>;
}

export function useAdminToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useAdminToast must be used inside AdminToastProvider");
  return value;
}
