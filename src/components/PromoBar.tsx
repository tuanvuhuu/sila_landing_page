"use client";

import { useEffect, useState } from "react";

function endOfMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
}

/** Thanh khuyến mãi luôn hiển thị ở đỉnh trang + đếm ngược tới cuối tháng. */
export default function PromoBar({ text = "Ưu đãi học thử tháng này" }: { text?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = () => {
    if (now === null) return "";
    const diff = Math.max(0, endOfMonth() - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    const p = (n: number) => String(n).padStart(2, "0");
    return d > 0 ? `${d} ngày ${p(h)}:${p(m)}:${p(s)}` : `${p(h)}:${p(m)}:${p(s)}`;
  };

  return (
    <a href="#offer" className="promo-bar" aria-label="Xem ưu đãi học thử">
      <span className="wrap promo-bar-in">
        <span className="promo-bar-text">
          🎁 {text} — còn <strong suppressHydrationWarning>{fmt()}</strong>
        </span>
        <span className="promo-bar-arrow" aria-hidden="true">→</span>
      </span>
    </a>
  );
}
