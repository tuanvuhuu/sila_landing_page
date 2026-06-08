import { prisma } from "@/lib/db";
import { getContent } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContactLink, ContactButtons } from "../../Contact";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await prisma.event.findUnique({ where: { id: Number(params.id) } });
  if (!ev) return { title: "Không tìm thấy sự kiện" };
  const c = await getContent();
  return {
    title: `${ev.title} — ${c.centerName}`,
    description: ev.description?.slice(0, 150) || `Sự kiện tại ${c.centerName}`,
    openGraph: ev.image ? { images: [ev.image] } : undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const [ev, c] = await Promise.all([
    prisma.event.findUnique({ where: { id: Number(params.id) } }),
    getContent(),
  ]);

  if (!ev || ev.status !== "published") notFound();

  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;
  const isPast = ev.date < new Date();

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="/" className="logo">
            <img src="/logo.png" alt={c.centerName} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </a>
          <div className="nav-right">
            <a href="/su-kien" className="btn btn-ghost">← Tất cả sự kiện</a>
          </div>
        </div>
      </header>

      <main className="ev-detail-page">
        <div className="wrap ev-detail-wrap">

          {/* Ảnh bìa */}
          {ev.image && (
            <div className="ev-detail-img">
              <img src={ev.image} alt={ev.title} />
              {isPast && <span className="ev-badge-past">Đã diễn ra</span>}
            </div>
          )}

          {/* Nội dung */}
          <div className="ev-detail-body">
            <div className="ev-date" style={{ fontSize: "0.95rem", marginBottom: "0.6rem" }}>
              📅 {fmtDate(ev.date)}
              {ev.endDate && ` – ${fmtDate(ev.endDate)}`}
            </div>

            <h1 className="ev-detail-title">{ev.title}</h1>

            {ev.location && (
              <p className="ev-detail-meta">📍 {ev.location}</p>
            )}

            {ev.description && (
              <div className="ev-detail-desc">
                {ev.description.split("\n").map((line, i) =>
                  line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>
                )}
              </div>
            )}

            {/* Gallery ảnh phụ */}
            {(() => {
              let imgs: string[] = [];
              try { imgs = JSON.parse((ev as Record<string, unknown>).images as string ?? "[]"); } catch { imgs = []; }
              if (!imgs.length) return null;
              return (
                <div className="ev-detail-gallery">
                  {imgs.map((src, i) => (
                    <div key={i} className="ev-detail-gallery-item">
                      <img src={src} alt={`${ev.title} ảnh ${i + 1}`} />
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* CTA */}
            {!isPast && (
              <div className="ev-detail-cta">
                {ev.ctaLink && ev.ctaLink !== "#signup" ? (
                  <a
                    href={ev.ctaLink}
                    className="btn btn-primary"
                    target={ev.ctaLink.startsWith("http") ? "_blank" : undefined}
                    rel={ev.ctaLink.startsWith("http") ? "noreferrer" : undefined}
                    style={{ fontSize: "1.05rem", padding: "0.85rem 2rem" }}
                  >
                    {ev.ctaText || "Đăng ký tham gia"} →
                  </a>
                ) : (
                  <a href="/#signup" className="btn btn-primary" style={{ fontSize: "1.05rem", padding: "0.85rem 2rem" }}>
                    {ev.ctaText || "Đăng ký tham gia"} →
                  </a>
                )}
                <a href={tel} className="btn btn-ghost" style={{ fontSize: "1rem" }}>
                  📞 Gọi ngay {c.contact.phone}
                </a>
              </div>
            )}

            {isPast && (
              <div className="ev-detail-cta">
                <a href="/#signup" className="btn btn-primary" style={{ fontSize: "1.05rem", padding: "0.85rem 2rem" }}>
                  🎁 Đăng ký khoá học tiếp theo →
                </a>
              </div>
            )}
          </div>

        </div>
      </main>

      <footer>
        <div className="wrap">
          <span className="logo">
            <img src="/logo.png" alt={c.centerName} style={{ background: "#fff", borderRadius: "50%", padding: 3 }} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </span>
          <p className="row"><ContactLink href={tel} method="phone">📞 {c.contact.phone}</ContactLink></p>
          <p className="row">📍 {c.contact.address}</p>
          <p className="row">✉️ {c.contact.email}</p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {c.contact.facebook && (
              <a href={c.contact.facebook} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#3b5998", fontWeight: 700, fontSize: "0.95rem" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
                Facebook
              </a>
            )}
            {c.contact.zalo && (
              <a href={c.contact.zalo.startsWith("http") ? c.contact.zalo : `https://zalo.me/${c.contact.zalo.replace(/\s/g, "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#0068ff", fontWeight: 700, fontSize: "0.95rem" }}>
                💬 Zalo
              </a>
            )}
            {c.contact.messenger && (
              <a href={c.contact.messenger} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#00b2ff", fontWeight: 700, fontSize: "0.95rem" }}>
                ⚡ Messenger
              </a>
            )}
          </div>

          <p className="row" style={{ marginTop: "1.5rem", fontSize: "0.85rem", opacity: 0.6 }}>
            © {new Date().getFullYear()} {c.centerName}
          </p>
        </div>
      </footer>

      <div className="mobile-cta">
        {c.contact.zalo && (
          <a
            href={c.contact.zalo.startsWith("http") ? c.contact.zalo : `https://zalo.me/${c.contact.zalo.replace(/\s/g, "")}`}
            className="mcta-zalo"
            target="_blank"
            rel="noreferrer"
          >
            💬 Zalo
          </a>
        )}
        <a href={tel} className="mcta-call">📞 Gọi ngay</a>
        <a href="/#signup" className="mcta-reg btn btn-primary">🎁 Đăng ký</a>
      </div>

      <ContactButtons
        phone={c.contact.phone}
        zalo={c.contact.zalo}
        messenger={c.contact.messenger}
        facebook={c.contact.facebook}
      />
    </>
  );
}
