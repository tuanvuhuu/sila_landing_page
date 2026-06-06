import { NextResponse } from "next/server";
import { isAuthedFromReq } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const filename = `esl-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // === Vercel Blob (production) ===
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type || "image/jpeg",
    });
    return NextResponse.json({ url: blob.url });
  }

  // === Fallback: lưu local (chỉ dùng khi dev, không hoạt động trên Vercel) ===
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const bytes = Buffer.from(await file.arrayBuffer());
  const localFilename = filename.replace("esl-uploads/", "");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, localFilename), bytes);
  return NextResponse.json({ url: `/uploads/${localFilename}` });
}
