"use client";

import { useEffect, useState } from "react";

/** Thanh tiến trình đọc ở đỉnh trang + nút "về đầu trang" khi cuộn xuống. */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
      setShow(h.scrollTop > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <button
        className={`to-top${show ? " show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Về đầu trang"
      >
        ↑
      </button>
    </>
  );
}
