"use client";

import { useEffect } from "react";

// Trang cảm ơn = trang chuyển đổi. Bắn PageView + CompleteRegistration để bạn có thể
// tạo "Custom Conversion" trên Facebook dựa theo URL /cam-on nếu muốn.
export default function ThankYouTracker() {
  useEffect(() => {
    window.fbq?.("track", "PageView");
    window.fbq?.("track", "CompleteRegistration");
  }, []);
  return null;
}
