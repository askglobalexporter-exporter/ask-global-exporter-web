"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

export function TurnstileField({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const resetMountedRef = useRef(false);
  const onTokenRef = useRef(onToken);

  useEffect(() => { onTokenRef.current = onToken; }, [onToken]);

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (!window.turnstile || !containerRef.current || widgetRef.current) return false;
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        size: "flexible",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
      return true;
    };
    if (render()) return;
    const interval = window.setInterval(() => { if (render()) window.clearInterval(interval); }, 100);
    return () => window.clearInterval(interval);
  }, [siteKey]);

  useEffect(() => {
    if (!resetMountedRef.current) { resetMountedRef.current = true; return; }
    if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
  }, [resetKey]);

  useEffect(() => () => {
    if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
  }, []);

  if (!siteKey) return null;
  return <div className="turnstile-field full-field" ref={containerRef} aria-label="Spam protection verification" />;
}
