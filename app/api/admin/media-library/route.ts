import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { roleCan } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || !roleCan(session.profile.role, "media.read")) {
    return NextResponse.json({ error:"Unauthorized." }, { status:401 });
  }

  const params = new URL(request.url).searchParams;
  if (params.get("scope") === "folders") {
    const { data, error } = await session.supabase
      .from("media_folders")
      .select("id,name")
      .order("name")
      .limit(100);
    if (error) return NextResponse.json({ error:error.message }, { status:500 });
    return NextResponse.json({ folders:data ?? [] }, { headers: { "Cache-Control": "private, max-age=60" } });
  }

  const search = (params.get("q") || "").replace(/[%_,]/g, " ").trim().slice(0, 80);
  const folder = (params.get("folder") || "").trim();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  let assetQuery = session.supabase
    .from("media_assets")
    .select("id,folder_id,filename,public_url,mime_type,width,height,alt_text,created_at")
    .like("mime_type", "image/%")
    .order("created_at", { ascending:false })
    .range(from, from + PAGE_SIZE);
  if (search) assetQuery = assetQuery.ilike("filename", `%${search}%`);
  if (folder) assetQuery = assetQuery.eq("folder_id", folder);

  const assetsResult = await assetQuery;
  if (assetsResult.error) return NextResponse.json({ error:assetsResult.error.message }, { status:500 });
  const rows = assetsResult.data ?? [];
  return NextResponse.json({ assets:rows.slice(0, PAGE_SIZE), nextPage:rows.length > PAGE_SIZE ? page + 1 : null });
}
