import { prisma } from "@/lib/db";
import { getContent } from "@/lib/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    </>
  );
}
