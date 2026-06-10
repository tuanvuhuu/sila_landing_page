"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

/**
 * Thư viện ảnh tối ưu bằng next/image + lightbox phóng to.
 * Bấm ảnh để mở, dùng phím ←/→ chuyển ảnh, Esc để đóng.
 */
export default function Gallery({ images, centerName }: { images: string[]; centerName: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;

  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(
    () => setIdx((i) => (i === null ? i : (i + images.length - 1) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setIdx((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  return (
    <>
      <div className="gal-grid">
        {images.map((src, i) => (
          <button
            className="gal-item reveal"
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Xem ảnh lớp học ${i + 1}`}
          >
            <Image
              src={src}
              alt={`Ảnh lớp học ${i + 1} — ${centerName}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
              style={{ objectFit: "cover" }}
            />
          </button>
        ))}
      </div>

      {open && (
        <div className="lb" onClick={close} role="dialog" aria-modal="true" aria-label="Xem ảnh">
          <button className="lb-close" onClick={close} aria-label="Đóng">
            ✕
          </button>
          {images.length > 1 && (
            <button
              className="lb-nav lb-prev"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Ảnh trước"
            >
              ‹
            </button>
          )}
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[idx!]}
              alt={`Ảnh lớp học ${idx! + 1} — ${centerName}`}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          {images.length > 1 && (
            <button
              className="lb-nav lb-next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Ảnh sau"
            >
              ›
            </button>
          )}
          <div className="lb-count">
            {idx! + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
