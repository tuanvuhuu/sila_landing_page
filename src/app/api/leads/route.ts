import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthedFromReq } from "@/lib/auth";
import { sendLeadToCapi, sendEnrolledToCapi } from "@/lib/fbcapi";
import { sendLeadEmail } from "@/lib/email";

export const runtime = "nodejs";

// Giới hạn tần suất đơn giản theo IP (chống spam/bot khi chạy ads).
// Lưu trong bộ nhớ tiến trình — đủ chặn các đợt spam dồn dập.
const RATE_LIMIT = 5; // số lần tối đa
const RATE_WINDOW = 10 * 60 * 1000; // trong 10 phút
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT;
}

function isValidVnPhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  return /^0\d{9}$/.test(digits) || /^\+?84\d{9}$/.test(digits);
}

// Phụ huynh điền form -> tạo lead mới (kèm nguồn quảng cáo)
export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, ageGroup, utm, dedupId, eventId, company } = body;
  // Mã sự kiện marketing (nếu lead đến từ trang /su-kien/{id})
  const evIdNum =
    eventId != null && eventId !== "" && Number.isFinite(Number(eventId))
      ? Math.trunc(Number(eventId))
      : null;

  // Honeypot: chỉ bot mới điền trường ẩn "company" -> giả vờ thành công, bỏ qua
  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !phone) {
    return NextResponse.json({ error: "Thiếu tên hoặc số điện thoại" }, { status: 400 });
  }
  if (String(name).length > 120 || String(phone).length > 30) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  if (!isValidVnPhone(String(phone))) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút." }, { status: 429 });
  }

  const u = utm || {};
  const leadData: {
    name: string; phone: string; ageGroup: string;
    utmSource: string; utmMedium: string; utmCampaign: string;
    utmContent: string; utmTerm: string; fbclid: string;
    eventId?: number;
  } = {
    name: String(name),
    phone: String(phone),
    ageGroup: String(ageGroup ?? ""),
    utmSource: String(u.utm_source ?? ""),
    utmMedium: String(u.utm_medium ?? ""),
    utmCampaign: String(u.utm_campaign ?? ""),
    utmContent: String(u.utm_content ?? ""),
    utmTerm: String(u.utm_term ?? ""),
    fbclid: String(u.fbclid ?? ""),
  };
  if (evIdNum != null) leadData.eventId = evIdNum;
  try {
    await prisma.lead.create({ data: leadData });
  } catch (err) {
    // Phòng trường hợp DB chưa kịp có cột eventId — vẫn lưu lead để không mất khách
    if (evIdNum != null && /eventId|P2022|column|Unknown arg/i.test(String(err))) {
      const retry = { ...leadData };
      delete retry.eventId;
      await prisma.lead.create({ data: retry });
    } else {
      throw err;
    }
  }

  await sendLeadToCapi({
    eventId: dedupId ? String(dedupId) : undefined,
    phone: String(phone),
    name: String(name),
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
    await sendEnrolledToCapi({
      phone: lead.phone,
      name: lead.name,
      fbclid: lead.fbclid || undefined
    });
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
