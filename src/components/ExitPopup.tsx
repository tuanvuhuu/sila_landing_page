"use client";

import { useEffect, useState } from "react";

/**
 * Popup nhắc nhận ưu đãi khi phụ huynh định rời trang (di chuột ra khỏi cửa sổ)
 * hoặc đã cuộn sâu trên mobile. Chỉ hiện 1 lần mỗi phiên.
 */
export default function ExitPopup({ title, desc }: { title: string; desc: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("exitOfferShown")) return;
    let done = false;

    const trigger = () => {
      if (done) return;
      done = true;
      sessionStorage.setItem("exitOfferShown", "1");
      setShow(true);
      window.fbq?.("trackCustom", "ExitIntentOffer");
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };
    const onScroll = () => {
      const progress = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (progress > 0.62) trigger();
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!show) return null;
  const close = () => setShow(false);

  return (
    <div className="exitpop" onClick={close} role="dialog" aria-modal="true" aria-label="Ưu đãi">
      <div className="exitpop-card" onClick={(e) => e.stopPropagation()}>
        <button className="exitpop-close" onClick={close} aria-label="Đóng">
          ✕
        </button>
        <span className="exitpop-badge">🎁 ĐỪNG BỎ LỠ</span>
        <h3>{title}</h3>
        <p>{desc}</p>
        <a href="#signup" className="btn btn-primary" onClick={close}>
          Nhận ưu đãi ngay →
        </a>
        <button className="exitpop-dismiss" onClick={close}>
          Để sau
        </button>
      </div>
    </div>
  );
}
