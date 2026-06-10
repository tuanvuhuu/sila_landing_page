"use client";

import { useEffect, useState } from "react";

/** Mặc định đếm ngược tới hết tháng hiện tại (cuối ngày). */
function endOfMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
}

export default function CountdownTimer({ deadline }: { deadline?: number }) {
  const target = deadline ?? endOfMonth();
  // null tới khi mount để tránh lệch hydration (server vs client)
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const mins = Math.floor(diff / 60000) % 60;
  const secs = Math.floor(diff / 1000) % 60;

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="cd-cell">
      <span className="cd-num">{String(v).padStart(2, "0")}</span>
      <span className="cd-lbl">{l}</span>
    </div>
  );

  return (
    <div className="countdown" aria-label="Thời gian còn lại của ưu đãi">
      <Cell v={days} l="ngày" />
      <span className="cd-sep">:</span>
      <Cell v={hours} l="giờ" />
      <span className="cd-sep">:</span>
      <Cell v={mins} l="phút" />
      <span className="cd-sep">:</span>
      <Cell v={secs} l="giây" />
    </div>
  );
}
