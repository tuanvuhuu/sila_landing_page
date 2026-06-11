import { getContent } from "@/lib/content";
import ThankYouTracker from "./ThankYouTracker";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cảm ơn bạn đã đăng ký — ESL Academy" };

export default async function ThankYou() {
  const c = await getContent();
  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;

  return (
    <main className="ty-wrap">
      <ThankYouTracker />
      <div className="ty-card">
        <img src="/logo.png" alt={c.centerName} className="ty-logo" />
        <div className="ty-emoji">🎉</div>
        <h1>Đăng ký thành công!</h1>
        <p>
          Cảm ơn ba mẹ đã đăng ký cho bé học thử tại <b>{c.centerName}</b>. Bộ phận tư vấn sẽ
          liên hệ trong vòng <b>24 giờ</b> để xếp lịch học thử phù hợp cho bé.
        </p>
        <p className="ty-sub">Trong lúc chờ, ba mẹ có thể liên hệ ngay với trung tâm:</p>
        <div className="ty-actions">
          <a className="btn btn-primary" href={tel}>📞 Gọi {c.contact.phone}</a>
          {c.contact.zalo && (
            <a className="btn btn-green" href={c.contact.zalo} target="_blank" rel="noreferrer">Nhắn Zalo</a>
          )}
          <a className="btn btn-ghost" href="/">Về trang chủ</a>
        </div>
      </div>
    </main>
  );
}
