"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type CarouselEvent = {
  id: number;
  title: string;
  description?: string;
  image?: string;
  dateLabel: string;
  dateISO?: string;
  location?: string;
  ctaText?: string;
  ctaLink?: string;
};

const MONTHS_SHORT = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

function soonLabel(days: number) {
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "Ngày mai";
  return `Còn ${days} ngày`;
}

export default function EventCarousel({
  events,
  variant = "full",
}: {
  events: CarouselEvent[];
  variant?: "full" | "history";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // "Còn X ngày" tính ở client để tránh lệch hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      {events.map((ev) => {
        const d = ev.dateISO ? new Date(ev.dateISO) : null;
        const daysLeft = d ? Math.ceil((d.getTime() - Date.now()) / 86400000) : null;
        return (
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
              <Image
                src={ev.image}
                alt={ev.title}
                fill
                sizes="(max-width: 768px) 85vw, 360px"
                style={{ objectFit: "cover" }}
              />
              {d && (
                <span className="ev-cal">
                  <strong>{d.getDate()}</strong>
                  <span>{MONTHS_SHORT[d.getMonth()]}</span>
                </span>
              )}
              {variant === "history" ? (
                <span className="ev-badge-past">Đã diễn ra</span>
              ) : (
                mounted && daysLeft !== null && daysLeft >= 0 && (
                  <span className="ev-soon">{soonLabel(daysLeft)}</span>
                )
              )}
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
        );
      })}
    </div>
  );
}
