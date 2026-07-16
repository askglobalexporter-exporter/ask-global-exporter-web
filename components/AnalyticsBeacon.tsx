"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const key = `ask-view:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const body = JSON.stringify({ path: pathname, event_type: pathname.startsWith("/products/") ? "product_view" : "page_view", product_slug: pathname.startsWith("/products/") ? pathname.split("/").filter(Boolean).at(-1) : null });
    const sent = navigator.sendBeacon?.("/api/analytics", new Blob([body], { type: "application/json" }));
    if (!sent) void fetch("/api/analytics", { method:"POST",headers:{"Content-Type":"application/json"},body,keepalive:true }).catch(() => undefined);
  }, [pathname]);
  return null;
}
