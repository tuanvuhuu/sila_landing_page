import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthedFromReq } from "@/lib/auth";
import { normalizeSite, DEFAULT_SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Liệt kê các site (kèm số lead) — dùng cho admin chọn site.
export async function GET(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const rows = await prisma.siteContent.findMany({ select: { site: true }, orderBy: { site: "asc" } });
  const sites = rows.map((r) => r.site);
  // Luôn có ít nhất site mặc định
  if (!sites.includes(DEFAULT_SITE)) sites.unshift(DEFAULT_SITE);
  const leadCounts = await prisma.lead.groupBy({ by: ["site"], _count: { _all: true } });
  const countMap: Record<string, number> = {};
  for (const lc of leadCounts) countMap[lc.site] = lc._count._all;
  return NextResponse.json(sites.map((site) => ({ site, leadCount: countMap[site] ?? 0 })));
}

// Tạo site mới (tạo dòng nội dung rỗng để site xuất hiện trong danh sách).
export async function POST(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const body = await req.json();
  const site = normalizeSite(body.site);
  if (!body.site || site !== String(body.site).trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Mã site chỉ gồm chữ thường, số, gạch ngang/gạch dưới (tối đa 40 ký tự)." },
      { status: 400 }
    );
  }
  const existing = await prisma.siteContent.findUnique({ where: { site } });
  if (existing) {
    return NextResponse.json({ error: "Mã site đã tồn tại." }, { status: 409 });
  }
  // "{}" -> getContent sẽ trộn với nội dung mặc định
  const nextId = ((await prisma.siteContent.aggregate({ _max: { id: true } }))._max.id ?? 0) + 1;
  await prisma.siteContent.create({ data: { id: nextId, site, data: "{}" } });
  return NextResponse.json({ ok: true, site });
}
