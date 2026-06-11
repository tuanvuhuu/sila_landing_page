"use client";

import { useEffect, useState } from "react";

// Dữ liệu mẫu (không phải thông tin thật) tạo cảm giác đông khách.
const SAMPLES = [
  { name: "Chị Hương", area: "Quận 7" },
  { name: "Anh Tuấn", area: "Quận 1" },
  { name: "Chị Mai", area: "Thủ Đức" },
  { name: "Chị Lan", area: "Bình Thạnh" },
  { name: "Anh Dũng", area: "Quận 3" },
  { name: "Chị Thảo", area: "Gò Vấp" },
  { name: "Chị Ngọc", area: "Quận 10" },
  { name: "Anh Hải", area: "Tân Bình" },
];

export default function SocialProofToast() {
  const [item, setItem] = useState<{ name: string; area: string; mins: number } | null>(null);

  useEffect(() => {
    let i = Math.floor(Math.random() * SAMPLES.length);
    let hideT: ReturnType<typeof setTimeout>;

    const show = () => {
      const s = SAMPLES[i % SAMPLES.length];
      i++;
      setItem({ ...s, mins: 2 + Math.floor(Math.random() * 28) });
      hideT = setTimeout(() => setItem(null), 5000);
    };

    const first = setTimeout(show, 8000);
    const id = setInterval(show, 18000);
    return () => {
      clearTimeout(first);
      clearTimeout(hideT);
      clearInterval(id);
    };
  }, []);

  if (!item) return null;

  return (
    <div className="sp-toast" role="status" aria-live="polite">
      <span className="sp-toast-ava">🎉</span>
      <div className="sp-toast-body">
        <div className="sp-toast-title">
          <strong>{item.name}</strong> · {item.area}
        </div>
        <div className="sp-toast-sub">vừa đăng ký học thử · {item.mins} phút trước</div>
      </div>
    </div>
  );
}
