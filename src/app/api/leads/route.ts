import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthedFromReq } from "@/lib/auth";
import { sendLeadToCapi, sendEnrolledToCapi } from "@/lib/fbcapi";
import { sendLeadEmail } from "@/lib/email";

export const runtime = "nodejs";

// Phụ huynh điền form -> tạo lead mới (kèm nguồn quảng cáo)
export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, ageGroup, utm, eventId } = body;
  if (!name || !phone) {
    return NextResponse.json({ error: "Thiếu tên hoặc số điện thoại" }, { status: 400 });
  }

  const u = utm || {};
  await prisma.lead.create({
    data: {
      name: String(name),
      phone: String(phone),
      ageGroup: String(ageGroup ?? ""),
      utmSource: String(u.utm_source ?? ""),
      utmMedium: String(u.utm_medium ?? ""),
      utmCampaign: String(u.utm_campaign ?? ""),
      utmContent: String(u.utm_content ?? ""),
      utmTerm: String(u.utm_term ?? ""),
      fbclid: String(u.fbclid ?? ""),
    },
  });

  // Gửi Lead về Facebook (server-side). eventId dùng chung với Pixel để khử trùng.
  await sendLeadToCapi({
    eventId: eventId ? String(eventId) : undefined,
    phone: String(phone),
    fbclid: u.fbclid,
    fbp: req.headers.get("cookie")?.match(/_fbp=([^;]+)/)?.[1],
    clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: req.headers.get("user-agent") ?? undefined,
    sourceUrl: req.headers.get("referer") ?? undefined,
  });

  // Gửi email thông báo cho trung tâm (nếu đã cấu hình Resend)
  await sendLeadEmail({
    name: String(name),
    phone: String(phone),
    ageGroup: ageGroup ? String(ageGroup) : "",
    utmSource: u.utm_source,
    utmCampaign: u.utm_campaign,
  });

  return NextResponse.json({ ok: true });
}

// Admin đổi trạng thái chăm sóc của một lead
export async function PATCH(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Thiếu id hoặc status" }, { status: 400 });
  }
  const lead = await prisma.lead.update({
    where: { id: Number(id) },
    data: { status: String(status) },
  });

  // Khi đánh dấu "đã ghi danh" -> gửi sự kiện Purchase về Facebook
  if (status === "enrolled") {
    await sendEnrolledToCapi({ phone: lead.phone, fbclid: lead.fbclid || undefined });
  }

  return NextResponse.json({ ok: true });
}

// Admin xem danh sách khách đăng ký
export async function GET(req: Request) {
  if (!isAuthedFromReq(req)) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}
