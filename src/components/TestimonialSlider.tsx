"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content";

function Stars({ n }: { n: number }) {
  const count = Math.min(5, Math.max(0, Math.round(n)));
  return (
    <span className="testi-stars" aria-label={`Đánh giá ${count} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={i < count ? "star on" : "star"} aria-hidden="true">
          <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Initials({ name }: { name: string }) {
  const initials = name.split(" ").slice(-2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return <span className="testi-avatar testi-avatar-init">{initials}</span>;
}

/** Slider testimonials tự chạy (cuộn ngang), tạm dừng khi rê chuột. */
export default function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length <= 1) return;
    let paused = false;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    const id = setInterval(() => {
      if (paused) return;
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const step = first.offsetWidth + gap;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 4) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: step, behavior: "smooth" });
    }, 4500);

    return () => {
      clearInterval(id);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
    };
  }, [items.length]);

  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close]);

  return (
    <>
      <div className="testi-slider" ref={trackRef}>
        {items.map((t, i) => (
          <div className="testi-slide" key={i}>
            <div className="testi-card">
              <span className="testi-quote">&ldquo;</span>
              <Stars n={t.rating} />
              <p className="testi-text">{t.text}</p>
              {t.avatar && (
                <button
                  type="button"
                  className="testi-feedback"
                  onClick={() => setLightbox(t.avatar)}
                  aria-label={`Xem ảnh feedback của ${t.name}`}
                >
                  <Image
                    src={t.avatar}
                    alt={`Ảnh feedback của ${t.name}`}
                    fill
                    sizes="(max-width: 640px) 80vw, 360px"
                    style={{ objectFit: "cover" }}
                  />
                  <span className="testi-feedback-zoom">🔍 Xem ảnh feedback</span>
                </button>
              )}
              <div className="testi-author">
                <Initials name={t.name} />
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="lb" onClick={close} role="dialog" aria-modal="true" aria-label="Xem ảnh feedback">
          <button className="lb-close" onClick={close} aria-label="Đóng">✕</button>
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox} alt="Ảnh feedback phụ huynh" fill sizes="100vw" style={{ objectFit: "contain" }} priority />
          </div>
        </div>
      )}
    </>
  );
}
