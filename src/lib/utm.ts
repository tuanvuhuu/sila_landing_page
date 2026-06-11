"use client";

export type Utm = Record<string, string>;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

/**
 * Thu thập UTM từ URL và lưu vào sessionStorage để tránh bị mất khi chuyển trang.
 */
export function initUtmTracker() {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams(window.location.search);
  UTM_KEYS.forEach((k) => {
    const v = p.get(k);
    if (v) {
      sessionStorage.setItem(`utm_${k}`, v);
    }
  });
}

/**
 * Lấy danh sách UTM đã lưu hoặc từ URL hiện tại.
 */
export function getPersistedUtm(): Utm {
  if (typeof window === "undefined") return {};
  const found: Utm = {};
  const p = new URLSearchParams(window.location.search);

  UTM_KEYS.forEach((k) => {
    // Ưu tiên lấy trực tiếp trên URL
    const urlVal = p.get(k);
    if (urlVal) {
      found[k] = urlVal;
      sessionStorage.setItem(`utm_${k}`, urlVal);
    } else {
      // Fallback về sessionStorage nếu URL không có
      const storedVal = sessionStorage.getItem(`utm_${k}`);
      if (storedVal) {
        found[k] = storedVal;
      }
    }
  });

  return found;
}
