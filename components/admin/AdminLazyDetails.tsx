"use client";

import { useState } from "react";

export function AdminLazyDetails({
  summary,
  children,
  className = "admin-list-card",
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return <details className={className} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>{summary}</summary>
    {open ? children : null}
  </details>;
}
