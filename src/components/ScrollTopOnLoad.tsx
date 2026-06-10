"use client";

import { useEffect } from "react";

/**
 * Khi mới vào trang luôn ở đầu trang: tắt khôi phục vị trí cuộn của trình duyệt
 * và cuộn lên đầu. Vẫn tôn trọng liên kết có #anchor (vd #signup).
 */
export default function ScrollTopOnLoad() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  return null;
}
