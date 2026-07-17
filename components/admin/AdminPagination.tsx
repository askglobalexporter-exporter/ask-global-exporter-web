import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPagination({
  basePath,
  page,
  pageCount,
  params = {},
}: {
  basePath: string;
  page: number;
  pageCount: number;
  params?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (targetPage: number) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    query.set("page", String(targetPage));
    return `${basePath}?${query.toString()}`;
  };

  return <nav className="admin-pagination" aria-label="Navigasi halaman">
    {page > 1
      ? <Link href={href(page - 1)}><ChevronLeft size={14} /> Sebelumnya</Link>
      : <span aria-disabled="true"><ChevronLeft size={14} /> Sebelumnya</span>}
    <small>Halaman <b>{page}</b> dari <b>{pageCount}</b></small>
    {page < pageCount
      ? <Link href={href(page + 1)}>Berikutnya <ChevronRight size={14} /></Link>
      : <span aria-disabled="true">Berikutnya <ChevronRight size={14} /></span>}
  </nav>;
}
