"use client";

import { useEffect, useRef } from "react";

export type CarouselEvent = {
  id: number;
  title: string;
  description?: string;
  image?: string;
  dateLabel: string;
  location?: string;
  ctaText?: string;
  ctaLink?: string;
};

export default function EventCarousel({
  events,
  variant = "full",
}: {
  events: CarouselEvent[];
  variant?: "full" | "history";
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || events.length <= 1) return;

    let paused = false;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
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
      if (track.scrollLeft >= maxScroll - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 5000);

    return () => {
      clearInterval(id);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
    };
  }, [events.length]);

  return (
    <div className="ev-carousel" ref={trackRef}>
      {events.map((ev) => (
        <a
          href={`/su-kien/${ev.id}`}
          className={`ev-card-link ev-slide`}
          key={ev.id}
        >
        <div
          className={`ev-card${variant === "history" ? " history ev-past" : ""}`}
        >
          {ev.image && (
            <div className="ev-img">
              <img src={ev.image} alt={ev.title} />
              {variant === "history" && <span className="ev-badge-past">Đã diễn ra</span>}
            </div>
          )}
          <div className="ev-body">
            <div className="ev-date">📅 {ev.dateLabel}</div>
            <h3 className="ev-title">{ev.title}</h3>
            {variant === "full" && ev.description && (
              <p className="ev-desc">{ev.description}</p>
            )}
            {ev.location && <p className="ev-loc">📍 {ev.location}</p>}
            {variant === "full" && ev.ctaLink && (
              <span className="btn btn-primary ev-cta">
                {ev.ctaText || "Đăng ký tham gia"} →
              </span>
            )}
          </div>
        </div>
        </a>
      ))}
    </div>
  );
}
