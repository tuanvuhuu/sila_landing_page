"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/content";

export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div className="faq-item" key={i}>
          <button
            className="faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.q}</span>
            <span className={`faq-icon${open === i ? " open" : ""}`}>+</span>
          </button>
          {open === i && (
            <div className="faq-a">
              <p>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
