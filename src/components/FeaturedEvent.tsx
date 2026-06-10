"use client";

import Image from "next/image";
import CountdownTimer from "./CountdownTimer";

export type FeaturedEventData = {
  id: number;
  title: string;
  description?: string;
  image?: string;
  dateLabel: string;
  dateISO: string;
  location?: string;
  ctaText?: string;
};

/** Banner sự kiện nổi bật (sự kiện sắp tới gần nhất) + đếm ngược tới ngày diễn ra. */
export default function FeaturedEvent({ event }: { event: FeaturedEventData }) {
  const target = new Date(event.dateISO).getTime();
  const href = `/su-kien/${event.id}`;

  return (
    <div className="featured-event reveal">
      <div className="fe-media">
        {event.image ? (
          <Image src={event.image} alt={event.title} fill sizes="(max-width: 860px) 92vw, 480px" style={{ objectFit: "cover" }} />
        ) : (
          <div className="fe-media-fallback">🎉</div>
        )}
        <span className="fe-tag">🌟 Sự kiện nổi bật</span>
      </div>

      <div className="fe-body">
        <div className="fe-meta">
          📅 {event.dateLabel}
          {event.location && <> · 📍 {event.location}</>}
        </div>
        <h3 className="fe-title">{event.title}</h3>
        {event.description && <p className="fe-desc">{event.description}</p>}

        <div className="fe-count">
          <span className="fe-count-label">⏳ Diễn ra sau:</span>
          <CountdownTimer deadline={target} />
        </div>

        <div className="fe-cta">
          <a href={href} className="btn btn-primary">
            {event.ctaText || "Đăng ký tham gia"} →
          </a>
          <a href="/su-kien" className="btn btn-ghost">
            Tất cả sự kiện
          </a>
        </div>
      </div>
    </div>
  );
}
