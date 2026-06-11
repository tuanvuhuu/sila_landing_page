"use client";

import { useEffect } from "react";

// Bắn sự kiện ViewContent (1 lần) khi người dùng cuộn tới phần chương trình học —
// dùng làm sự kiện "phễu trên" để Facebook tối ưu khi lượng Lead còn ít.
export default function EngagementTracker() {
  useEffect(() => {
    const el = document.getElementById("programs");
    if (!el || typeof window === "undefined") return;

    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !fired) {
            fired = true;
            window.fbq?.("track", "ViewContent", { content_name: "Chuong trinh hoc" });
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
