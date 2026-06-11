type LeadEmail = {
  name: string;
  phone: string;
  ageGroup?: string;
  utmSource?: string;
  utmCampaign?: string;
};

function esc(s: string): string {
  return String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
}

// Gửi email thông báo khi có khách đăng ký. Dùng dịch vụ Resend (gọi REST API,
// không cần cài thêm thư viện). Chỉ chạy nếu đã đặt RESEND_API_KEY trong .env.
export async function sendLeadEmail(lead: LeadEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // chưa cấu hình -> bỏ qua (không lỗi)

  const to = process.env.LEAD_NOTIFY_EMAIL || "tuanvuhuu2798@gmail.com";
  const from = process.env.LEAD_FROM_EMAIL || "ESL Academy <onboarding@resend.dev>";
  const source = lead.utmSource
    ? `${lead.utmSource}${lead.utmCampaign ? " / " + lead.utmCampaign : ""}`
    : "Trực tiếp";

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#333;max-width:480px">
      <h2 style="color:#5F8F2E;margin:0 0 12px">🎉 Khách đăng ký học thử mới</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#888">Phụ huynh</td><td style="padding:4px 0"><b>${esc(lead.name)}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Điện thoại</td><td style="padding:4px 0"><b>${esc(lead.phone)}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Độ tuổi bé</td><td style="padding:4px 0">${esc(lead.ageGroup || "—")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Nguồn</td><td style="padding:4px 0">${esc(source)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888">Thời gian</td><td style="padding:4px 0">${new Date().toLocaleString("vi-VN")}</td></tr>
      </table>
      <p style="margin-top:16px"><a href="tel:${esc(lead.phone.replace(/\s/g, ""))}" style="background:#F58220;color:#fff;text-decoration:none;padding:8px 16px;border-radius:8px">Gọi lại ngay</a></p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
      <p style="color:#999;font-size:13px">Gửi tự động từ landing page ESL Academy.</p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `Khách mới: ${lead.name} - ${lead.phone}`,
        html,
      }),
    });
  } catch {
    // không để lỗi email ảnh hưởng tới việc lưu lead
  }
}
