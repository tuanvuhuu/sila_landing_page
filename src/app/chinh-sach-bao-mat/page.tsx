import type { Metadata } from "next";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: `Chính sách bảo mật — ${c.centerName}`,
    description: `Chính sách bảo mật thông tin của ${c.centerName}.`,
    robots: { index: true, follow: true },
    alternates: { canonical: "/chinh-sach-bao-mat" },
  };
}

export default async function PrivacyPolicyPage() {
  const c = await getContent();
  const updated = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="/" className="logo">
            <img src="/logo.png" alt={c.centerName} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </a>
          <div className="nav-right">
            <a href="/" className="btn btn-ghost">← Trang chủ</a>
          </div>
        </div>
      </header>

      <main className="policy">
        <div className="wrap policy-wrap">
          <h1>Chính sách bảo mật</h1>
          <p className="policy-updated">Cập nhật lần cuối: {updated}</p>

          <p>
            {c.centerName} (&ldquo;chúng tôi&rdquo;) tôn trọng và cam kết bảo vệ thông tin cá nhân của
            quý phụ huynh và học viên. Chính sách này giải thích cách chúng tôi thu thập, sử dụng
            và bảo vệ thông tin khi quý vị truy cập website hoặc đăng ký nhận tư vấn.
          </p>

          <h2>1. Thông tin chúng tôi thu thập</h2>
          <ul>
            <li>Thông tin quý vị cung cấp khi đăng ký: <strong>họ tên, số điện thoại, độ tuổi của bé</strong>.</li>
            <li>Thông tin kỹ thuật: nguồn truy cập (UTM), cookie, địa chỉ IP, loại thiết bị/trình duyệt.</li>
          </ul>

          <h2>2. Mục đích sử dụng</h2>
          <ul>
            <li>Liên hệ tư vấn và xếp lịch học thử cho bé.</li>
            <li>Chăm sóc, hỗ trợ và cải thiện chất lượng dịch vụ.</li>
            <li>Đo lường và tối ưu hiệu quả quảng cáo.</li>
          </ul>

          <h2>3. Cookie và công cụ đo lường</h2>
          <p>
            Website sử dụng cookie cùng các công cụ như <strong>Facebook Pixel</strong>,
            <strong> Google Analytics</strong> và <strong>TikTok Pixel</strong> để phân tích lưu lượng
            và tối ưu quảng cáo. Quý vị có thể tắt cookie trong cài đặt trình duyệt.
          </p>

          <h2>4. Chia sẻ thông tin</h2>
          <p>
            Chúng tôi <strong>không bán</strong> thông tin cá nhân của quý vị. Dữ liệu chỉ có thể được
            chia sẻ ở dạng mã hóa/ẩn danh với các nền tảng quảng cáo (Meta, Google) nhằm mục đích đo
            lường chuyển đổi, hoặc khi pháp luật yêu cầu.
          </p>

          <h2>5. Lưu trữ và bảo mật</h2>
          <p>
            Thông tin được lưu trữ an toàn và chỉ được truy cập bởi nhân sự có thẩm quyền của
            {" "}{c.centerName} phục vụ việc tư vấn, chăm sóc học viên.
          </p>

          <h2>6. Quyền của quý vị</h2>
          <p>
            Quý vị có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình. Vui lòng liên
            hệ với chúng tôi theo thông tin bên dưới.
          </p>

          <h2>7. Liên hệ</h2>
          <p>
            <strong>{c.centerName}</strong><br />
            {c.contact.email && <>Email: <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a><br /></>}
            {c.contact.phone && <>Điện thoại: <a href={`tel:${c.contact.phone.replace(/\s/g, "")}`}>{c.contact.phone}</a><br /></>}
            {c.contact.address && <>Địa chỉ: {c.contact.address}</>}
          </p>

          <p className="policy-note">
            Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được đăng tải
            trên trang này.
          </p>

          <div className="policy-back">
            <a href="/" className="btn btn-primary">← Về trang chủ</a>
          </div>
        </div>
      </main>
    </>
  );
}
