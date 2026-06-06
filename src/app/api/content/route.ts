import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthedFromReq } from "@/lib/auth";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

// Trang công khai gọi GET để lấy nội dung mới nhất
export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

// Trang admin gọi PUT để lưu nội dung (phải đăng nhập)
export async function PUT(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const data = await req.json();
  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: { data: JSON.stringify(data) },
    create: { id: 1, data: JSON.stringify(data) },
  });
  return NextResponse.json({ ok: true });
}
