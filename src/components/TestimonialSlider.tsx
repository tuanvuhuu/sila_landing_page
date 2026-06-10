"use client";

import { useEffect, useRef } from "react";
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

function Avatar({ name, src }: { name: string; src: string }) {
  if (src) return <Image className="testi-avatar" src={src} alt={name} width={46} height={46} />;
  const initials = name.split(" ").slice(-2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return <span className="testi-avatar testi-avatar-init">{initials}</span>;
}

/** Slider testimonials tự chạy (cuộn ngang), tạm dừng khi rê chuột. */
export default function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="testi-slider" ref={trackRef}>
      {items.map((t, i) => (
        <div className="testi-slide" key={i}>
          <div className="testi-card">
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
        </div>
      ))}
    </div>
  );
}
