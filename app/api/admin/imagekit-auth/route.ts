import { NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { roleCan } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session || !roleCan(session.profile.role, "media.write")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "ImageKit upload is not configured." }, { status: 503 });
  }

  const authenticationParameters = getUploadAuthParams({ publicKey, privateKey });
  return NextResponse.json({ ...authenticationParameters, publicKey });
}
