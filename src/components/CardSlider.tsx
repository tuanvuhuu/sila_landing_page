"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Khung slider cuộn ngang dùng chung (vuốt trái/phải). Nếu `autoMs` > 0 thì
 * tự trượt sau mỗi `autoMs` mili-giây, tạm dừng khi rê chuột.
 */
export default function CardSlider({
  className = "",
  autoMs = 0,
  children,
}: {
  className?: string;
  autoMs?: number;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !autoMs) return;

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
    }, autoMs);

    return () => {
      clearInterval(id);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
    };
  }, [autoMs]);

  return (
    <div className={`card-slider ${className}`} ref={trackRef}>
      {children}
    </div>
  );
}
