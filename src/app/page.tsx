import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/db";
import LeadForm from "./LeadForm";
import { ContactLink, ContactButtons } from "./Contact";
import EngagementTracker from "./EngagementTracker";
import FaqSection from "./FaqSection";
import EventCarousel from "./EventCarousel";
import SocialChatWidgets from "@/components/SocialChatWidgets";
import ChatbotWidget from "@/components/ChatbotWidget";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: `${c.centerName} — Học tiếng Anh cho bé 3–10 tuổi`,
    description: c.hero.subtitle,
    openGraph: {
      title: `${c.centerName} — ${c.hero.title}`,
      description: c.hero.subtitle,
      type: "website",
      locale: "vi_VN",
      ...(c.hero.image ? { images: [{ url: c.hero.image, width: 1200, height: 630 }] } : {}),
    },
  };
}

/* ---- Icon vẽ riêng theo phong cách logo (phẳng, xanh lá + cam) ---- */
function CapIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 4L22 8.5 12 13 2 8.5z" fill="#80B848" />
      <path d="M6.5 11v3.4c0 1.6 2.5 2.7 5.5 2.7s5.5-1.1 5.5-2.7V11L12 13.4z" fill="#5F8F2E" />
      <path d="M22 8.5v4.1" stroke="#F58220" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="13.3" r="1.3" fill="#F58220" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5.5c2.6-.6 5-.3 7.2 1.2v11.8c-2.2-1.5-4.6-1.8-7.2-1.2z" fill="#80B848" />
      <path d="M20 5.5c-2.6-.6-5-.3-7.2 1.2v11.8c2.2-1.5 4.6-1.8 7.2-1.2z" fill="#F58220" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z" fill="#F58220" />
    </svg>
  );
}
function SpeechIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5h16a1.6 1.6 0 0 1 1.6 1.6v7a1.6 1.6 0 0 1-1.6 1.6h-9l-4 3v-3H4A1.6 1.6 0 0 1 2.4 13.6V6.6A1.6 1.6 0 0 1 4 5z" fill="#80B848" />
      <circle cx="8.5" cy="10.1" r="1.1" fill="#fff" />
      <circle cx="12" cy="10.1" r="1.1" fill="#fff" />
      <circle cx="15.5" cy="10.1" r="1.1" fill="#fff" />
    </svg>
  );
}
function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="8" cy="8" r="3" fill="#80B848" />
      <circle cx="16" cy="8" r="3" fill="#A6C940" />
      <path d="M2.5 19c0-3 2.2-5 5.5-5s5.5 2 5.5 5z" fill="#80B848" />
      <path d="M10.5 19c0-3 2.2-5 5.5-5s5.5 2 5.5 5z" fill="#A6C940" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 7.5c-1.2-1.7-3.8-2-5.3 0-1.7 2.2-1 6.3 1 8.3 1 1 1.6 1.2 4.3 1.2s3.3-.2 4.3-1.2c2-2 2.7-6.1 1-8.3-1.5-2-4.1-1.7-5.3 0z" fill="#F58220" />
      <path d="M12 7.5c0-1.6.9-2.7 2.2-3.2" stroke="#80B848" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="#80B848" />
      <path d="M8 12.2l2.6 2.6L16 9.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  const count = Math.min(5, Math.max(0, Math.round(n)));
  return (
    <span className="testi-stars">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function Avatar({ name, src }: { name: string; src: string }) {
  if (src) return <img className="testi-avatar" src={src} alt={name} />;
  const initials = name.split(" ").slice(-2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return <span className="testi-avatar testi-avatar-init">{initials}</span>;
}

const PROGRAM_ICONS = [CapIcon, BookIcon, StarIcon];
const FEATURE_ICONS = [SpeechIcon, GroupIcon, AppleIcon, CheckIcon];

export default async function Home() {
  const c = await getContent();
  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;

  // Sự kiện: sắp tới (tất cả đang bật) + đã diễn ra (lịch sử, tối đa 6)
  const now = new Date();
  const [upcomingEvents, pastEvents] = await Promise.all([
    prisma.event.findMany({
      where: { status: "published", date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { status: "published", date: { lt: now } },
      orderBy: { date: "desc" },
      take: 6,
    }),
  ]);

  const fmtEventDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  const upcomingCards = upcomingEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    description: ev.description,
    image: ev.image,
    dateLabel: fmtEventDate(ev.date),
    location: ev.location,
    ctaText: ev.ctaText,
    ctaLink: ev.ctaLink,
  }));

  const pastCards = pastEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    image: ev.image,
    dateLabel: fmtEventDate(ev.date),
    location: ev.location,
  }));

  return (
    <>
      <EngagementTracker />

      <header className="nav">
        <div className="wrap nav-in">
          <span className="logo">
            <img src="/logo.png" alt={c.centerName} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </span>
          <div className="nav-right">
            <ContactLink href={tel} method="phone" className="nav-phone">📞 {c.contact.phone}</ContactLink>
            <a href="#signup" className="btn btn-primary">{c.hero.ctaText}</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">{c.hero.eyebrow}</span>
            <h1>{c.hero.title}</h1>
            <p className="lead">{c.hero.subtitle}</p>
            <div className="hero-cta">
              <a href="#signup" className="btn btn-primary">🎁 {c.hero.ctaText}</a>
              <a href="#programs" className="btn btn-ghost">Xem chương trình</a>
            </div>
          </div>
          <div className="hero-art">
            <div className="badge-ring">
              <img src={c.hero.image || "/logo.png"} alt={c.centerName} />
            </div>
            <span className="chip c1"><span className="d" style={{ background: "#80B848" }} /> Giáo viên bản ngữ</span>
            <span className="chip c2"><span className="d" style={{ background: "#F58220" }} /> Lớp ≤ 10 bé</span>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="wrap stat-grid">
          {c.stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="programs" id="programs">
        <div className="wrap">
          <div className="head">
            <span className="kicker">Chương trình học</span>
            <h2>Lộ trình theo từng độ tuổi</h2>
          </div>
          <div className="prog-grid">
            {c.programs.map((p, i) => {
              const Icon = PROGRAM_ICONS[i % PROGRAM_ICONS.length];
              return (
                <div className="prog" key={i}>
                  <div className="pico"><Icon /></div>
                  <span className="age">{p.age}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="why" id="why">
        <div className="wrap">
          <div className="head">
            <span className="kicker">Vì sao chọn chúng tôi</span>
            <h2>Điều khiến phụ huynh yên tâm</h2>
          </div>
          <div className="why-grid">
            {c.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <div className="feature" key={i}>
                  <span className="fico"><Icon /></span>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {c.testimonials.length > 0 && (
        <section className="testimonials">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Phụ huynh nói gì</span>
              <h2>Hàng nghìn gia đình đã tin tưởng 💬</h2>
            </div>
            <div className="testi-grid">
              {c.testimonials.map((t, i) => (
                <div className="testi-card" key={i}>
                  <span className="testi-quote">&ldquo;</span>
                  <Stars n={t.rating} />
                  <p className="testi-text">{t.text}</p>
                  <div className="testi-author">
                    <Avatar name={t.name} src={t.avatar} />
                    <div>
                      <div className="testi-name">{t.name}</div>
                      <div className="testi-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {upcomingCards.length > 0 && (
        <section className="events-section" id="events">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Sự kiện sắp tới</span>
              <h2>Đừng bỏ lỡ các hoạt động hấp dẫn 🎉</h2>
            </div>
            <EventCarousel events={upcomingCards} variant="full" />
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <a href="/su-kien" className="btn btn-ghost">Xem tất cả sự kiện →</a>
            </div>
          </div>
        </section>
      )}

      {pastCards.length > 0 && (
        <section className="events-section events-past">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Lịch sử</span>
              <h2>Sự kiện vừa diễn ra 📸</h2>
            </div>
            <EventCarousel events={pastCards} variant="history" />
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <a href="/su-kien" className="btn btn-ghost">Xem tất cả sự kiện →</a>
            </div>
          </div>
        </section>
      )}

      {c.gallery.length > 0 && (
        <section className="gallery">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Không gian học tập</span>
              <h2>Một ngày ở {c.centerName} 📸</h2>
            </div>
            <div className="gal-grid">
              {c.gallery.map((src, i) => (
                <div className="gal-item" key={i}>
                  <img src={src} alt={`Ảnh lớp học ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.faq.length > 0 && (
        <section className="faq-section">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Câu hỏi thường gặp</span>
              <h2>Ba mẹ hay hỏi về điều gì?</h2>
            </div>
            <div className="faq-inner">
              <FaqSection items={c.faq} />
            </div>
          </div>
        </section>
      )}

      <section className="offer">
        <div className="wrap">
          <div className="offer-card">
            <span className="badge-free">🎁 ƯU ĐÃI</span>
            <h2>{c.promo.title}</h2>
            <p>{c.promo.desc}</p>
            <a href="#signup" className="btn btn-primary">Nhận ưu đãi ngay →</a>
          </div>
        </div>
      </section>

      <section className="signup" id="signup">
        <div className="wrap">
          <div className="form-card">
            <h2>Đăng ký học thử miễn phí 🎈</h2>
            <p className="sub">Để lại thông tin, trung tâm sẽ gọi lại để xếp lịch học thử cho bé.</p>
            <LeadForm ctaText={c.hero.ctaText} />
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <span className="logo">
            <img src="/logo.png" alt={c.centerName} style={{ background: "#fff", borderRadius: "50%", padding: 3 }} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </span>
          <p className="row"><ContactLink href={tel} method="phone">📞 {c.contact.phone}</ContactLink></p>
          <p className="row">📍 {c.contact.address}</p>
          <p className="row">✉️ {c.contact.email}</p>
          <p className="row" style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.6 }}>
            © {new Date().getFullYear()} {c.centerName}
          </p>
        </div>
      </footer>

      <div className="mobile-cta">
        <a href={tel} className="mcta-call">📞 Gọi ngay</a>
        <a href="#signup" className="mcta-reg btn btn-primary">🎁 Đăng ký học thử</a>
      </div>

      <ContactButtons phone={c.contact.phone} zalo={c.contact.zalo} messenger={c.contact.messenger} facebook={c.contact.facebook} />

      <SocialChatWidgets fbPageId={c.contact.fbPageId} zaloOAId={c.contact.zaloOAId} />

      <ChatbotWidget config={c.chatbot} faq={c.faq} />
    </>
  );
}
