"use client";

import type { ComponentProps } from "react";
import { useAdminToast } from "./AdminToast";

type Props = Omit<ComponentProps<"form">, "action"> & {
  action:(formData:FormData)=>Promise<unknown>;
  successMessage:string;
  pendingMessage?:string;
};

export function AdminActionForm({ action, successMessage, pendingMessage="Sedang memproses…", children, ...props }: Props) {
  const { notify } = useAdminToast();
  async function submit(formData:FormData) {
    notify("info", pendingMessage);
    try {
      await action(formData);
      notify("success", successMessage);
    } catch (error) {
      const message = error instanceof Error && !error.message.includes("NEXT_REDIRECT") ? error.message : "Proses gagal. Silakan coba lagi.";
      notify("error", message);
    }
  }
  return <form action={submit} {...props}>{children}</form>;
}

