import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";

// Lấy danh sách sự kiện (public)
// ?history=1 → sự kiện đã qua; mặc định → sự kiện sắp tới
// ?limit=3  → giới hạn số lượng
export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const history = url.searchParams.get("history") === "1";
  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const now = new Date();

  // Admin: lấy tất cả sự kiện (cần auth)
  if (all) {
    if (!isAuthed()) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(events);
  }

  const events = await prisma.event.findMany({
    where: {
      status: "published",
      date: history ? { lt: now } : { gte: now },
    },
    orderBy: { date: history ? "desc" : "asc" },
    ...(limit ? { take: limit } : {}),
  });

  return NextResponse.json(events);
}

// Tạo sự kiện mới (cần auth)
export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const body = await req.json();
  const { title, description, image, date, endDate, location, ctaText, ctaLink, status } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc ngày" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title: String(title),
      description: String(description ?? ""),
      image: String(image ?? ""),
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location: String(location ?? ""),
      ctaText: String(ctaText || "Đăng ký tham gia"),
      ctaLink: String(ctaLink || "#signup"),
      status: String(status || "draft"),
    },
  });

  return NextResponse.json(event);
}

// Cập nhật sự kiện (cần auth)
export async function PUT(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = String(data.title);
  if (data.description !== undefined) updateData.description = String(data.description);
  if (data.image !== undefined) updateData.image = String(data.image);
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.location !== undefined) updateData.location = String(data.location);
  if (data.ctaText !== undefined) updateData.ctaText = String(data.ctaText);
  if (data.ctaLink !== undefined) updateData.ctaLink = String(data.ctaLink);
  if (data.status !== undefined) updateData.status = String(data.status);

  const event = await prisma.event.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return NextResponse.json(event);
}

// Xóa sự kiện (cần auth)
export async function DELETE(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }

  await prisma.event.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
