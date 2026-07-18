import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { roleCan } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || !roleCan(session.profile.role, "media.read")) {
    return NextResponse.json({ error:"Unauthorized." }, { status:401 });
  }

  const params = new URL(request.url).searchParams;
  const search = (params.get("q") || "").replace(/[%_,]/g, " ").trim().slice(0, 80);
  const folder = (params.get("folder") || "").trim();
  let assetQuery = session.supabase
    .from("media_assets")
    .select("id,folder_id,filename,public_url,mime_type,width,height,alt_text,created_at")
    .like("mime_type", "image/%")
    .order("created_at", { ascending:false })
    .limit(60);
  if (search) assetQuery = assetQuery.ilike("filename", `%${search}%`);
  if (folder) assetQuery = assetQuery.eq("folder_id", folder);

  const [assetsResult, foldersResult] = await Promise.all([
    assetQuery,
    session.supabase.from("media_folders").select("id,name").order("name"),
  ]);
  if (assetsResult.error) return NextResponse.json({ error:assetsResult.error.message }, { status:500 });
  return NextResponse.json({ assets:assetsResult.data ?? [], folders:foldersResult.data ?? [] });
}
