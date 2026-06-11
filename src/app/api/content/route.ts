import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthedFromReq } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { normalizeSite } from "@/lib/site";

export const dynamic = "force-dynamic";

// GET nội dung. Mặc định = site của deployment hiện tại (công khai).
// ?site=xxx (cần đăng nhập) -> nội dung của site bất kỳ (dùng cho admin).
export async function GET(req: Request) {
  const siteParam = new URL(req.url).searchParams.get("site");
  if (siteParam) {
    if (!isAuthedFromReq(req)) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    return NextResponse.json(await getContent(normalizeSite(siteParam)));
  }
  return NextResponse.json(await getContent());
}

// Trang admin gọi PUT để lưu nội dung của một site (phải đăng nhập)
export async function PUT(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const body = await req.json();
  const { site: rawSite, ...data } = body;
  const site = normalizeSite(rawSite);
  const nextId = ((await prisma.siteContent.aggregate({ _max: { id: true } }))._max.id ?? 0) + 1;
  await prisma.siteContent.upsert({
    where: { site },
    update: { data: JSON.stringify(data) },
    create: { id: nextId, site, data: JSON.stringify(data) },
  });
  return NextResponse.json({ ok: true });
}
