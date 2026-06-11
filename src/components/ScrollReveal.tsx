"use client";

import { useEffect } from "react";

/**
 * Thêm hiệu ứng "hiện dần khi cuộn" cho mọi phần tử có class `reveal`.
 * Phần tử được server render kèm class `reveal` (đang ẩn sẵn từ lần vẽ đầu —
 * không bị nhấp nháy). Khi cuộn tới, IntersectionObserver thêm class `is-in`.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    // Hiệu ứng so le: phần tử cùng cha hiện lần lượt
    const groupCount = new Map<Element, number>();
    els.forEach((el) => {
      const parent = el.parentElement ?? document.body;
      const i = groupCount.get(parent) ?? 0;
      groupCount.set(parent, i + 1);
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
