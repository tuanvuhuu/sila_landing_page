"use client";

import { useEffect, useState } from "react";
import type { SocialProofItem } from "@/lib/content";

export default function SocialProofToast({ items }: { items: SocialProofItem[] }) {
  const [item, setItem] = useState<{ name: string; area: string; mins: number } | null>(null);

  useEffect(() => {
    if (!items.length) return;
    let i = Math.floor(Math.random() * items.length);
    let hideT: ReturnType<typeof setTimeout>;

    const show = () => {
      const s = items[i % items.length];
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
  }, [items]);

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
