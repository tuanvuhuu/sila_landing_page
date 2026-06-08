import { NextResponse } from "next/server";
import { isAuthedFromReq } from "@/lib/auth";

// Endpoint tạm thời để debug Vercel Blob config — XÓA sau khi fix xong
export async function GET(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  return NextResponse.json({
    HAS_BLOB_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    HAS_BLOB_STORE_ID: !!process.env.BLOB_STORE_ID,
    BLOB_STORE_ID: process.env.BLOB_STORE_ID ?? null,
    NODE_ENV: process.env.NODE_ENV,
  });
}
