"use client";

import { useState } from "react";

type Event = {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  endDate: string | null;
  location: string;
  ctaText: string;
  ctaLink: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

function EventCard({ event, isPast }: { event: Event; isPast?: boolean }) {
  return (
    <div className={`ev-card${isPast ? " ev-past" : ""}`}>
      {event.image && (
        <div className="ev-img">
          <img src={event.image} alt={event.title} />
          {isPast && <span className="ev-badge-past">Đã kết thúc</span>}
        </div>
      )}
      <div className="ev-body">
        <div className="ev-date">
          📅 {formatDate(event.date)}
          {event.endDate && ` — ${formatDate(event.endDate)}`}
        </div>
        <h3 className="ev-title">{event.title}</h3>
        {event.description && <p className="ev-desc">{event.description}</p>}
        {event.location && <p className="ev-loc">📍 {event.location}</p>}
        {!isPast && event.ctaLink && (
          <a
            href={event.ctaLink}
            className="btn btn-primary ev-cta"
            target={event.ctaLink.startsWith("http") ? "_blank" : undefined}
            rel={event.ctaLink.startsWith("http") ? "noreferrer" : undefined}
          >
            {event.ctaText || "Đăng ký tham gia"} →
          </a>
        )}
      </div>
    </div>
  );
}

export default function EventTabs({
  upcoming,
  past,
}: {
  upcoming: Event[];
  past: Event[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const events = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <div className="ev-tabs">
        <button
          className={`ev-tab${tab === "upcoming" ? " ev-tab-active" : ""}`}
          onClick={() => setTab("upcoming")}
        >
          Sắp tới ({upcoming.length})
        </button>
        <button
          className={`ev-tab${tab === "past" ? " ev-tab-active" : ""}`}
          onClick={() => setTab("past")}
        >
          Đã diễn ra ({past.length})
        </button>
      </div>

      {events.length === 0 ? (
        <p className="ev-empty">
          {tab === "upcoming"
            ? "Hiện chưa có sự kiện nào sắp tới. Hãy theo dõi để cập nhật!"
            : "Chưa có sự kiện nào đã diễn ra."}
        </p>
      ) : (
        <div className="ev-list">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} isPast={tab === "past"} />
          ))}
        </div>
      )}
    </>
  );
}
