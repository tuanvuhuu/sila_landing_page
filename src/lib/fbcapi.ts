import crypto from "crypto";

function hash(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

type Common = {
  phone: string;
  fbclid?: string;
  fbp?: string;
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
};

function buildUserData(c: Common): Record<string, unknown> {
  const digits = c.phone.replace(/\D/g, "");
  const ud: Record<string, unknown> = { ph: [hash(digits)] };
  if (c.fbclid) ud.fbc = `fb.1.${Date.now()}.${c.fbclid}`;
  if (c.fbp) ud.fbp = c.fbp;
  if (c.clientIp) ud.client_ip_address = c.clientIp;
  if (c.userAgent) ud.client_user_agent = c.userAgent;
  return ud;
}

async function send(event: Record<string, unknown>): Promise<void> {
  const pixelId = process.env.FB_PIXEL_ID;
  const token = process.env.FB_CAPI_TOKEN;
  if (!pixelId || !token) return; // chưa cấu hình -> bỏ qua
  try {
    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
  } catch {
    // không để lỗi tracking ảnh hưởng tới việc lưu dữ liệu
  }
}

// Sự kiện Lead (đăng ký form). eventId dùng chung với Pixel để Facebook khử trùng.
export async function sendLeadToCapi(c: Common & { eventId?: string }): Promise<void> {
  await send({
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: c.eventId,
    action_source: "website",
    event_source_url: c.sourceUrl,
    user_data: buildUserData(c),
  });
}

// Sự kiện Purchase (khách đã ghi danh) — gửi khi admin đổi trạng thái sang "enrolled".
// Giúp Facebook tối ưu để tìm người THỰC SỰ ghi danh, không chỉ người điền form.
export async function sendEnrolledToCapi(c: Common): Promise<void> {
  const value = Number(process.env.FB_PURCHASE_VALUE || 0);
  const currency = process.env.FB_CURRENCY || "VND";
  await send({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: buildUserData(c),
    custom_data: { value, currency },
  });
}
