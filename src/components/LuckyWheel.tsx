"use client";

import { useState } from "react";
import LeadForm from "@/app/LeadForm";
import type { WheelPrize } from "@/lib/content";

const FALLBACK_COLORS = ["#80b848", "#f58220", "#a6c940", "#e2710e", "#5f8f2e", "#f9a94d"];
const R = 95;
const C = 100;

function pt(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + radius * Math.sin(a), y: C - radius * Math.cos(a) };
}

export default function LuckyWheel({ prizes }: { prizes: WheelPrize[] }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const N = prizes.length;
  const SEG = N > 0 ? 360 / N : 360;

  function spin() {
    if (spinning || result !== null || N === 0) return;
    const win = Math.floor(Math.random() * N);
    const center = win * SEG + SEG / 2;
    const base = rotation - (rotation % 360);
    const target = base + 360 * 5 + (360 - center);
    setSpinning(true);
    setRotation(target);
    setTimeout(() => {
      setSpinning(false);
      setResult(win);
    }, 4200);
  }

  return (
    <div className="wheel-wrap">
      <div className="wheel-stage">
        <span className="wheel-pointer" aria-hidden="true" />
        <svg className="wheel-svg" viewBox="0 0 200 200" style={{ transform: `rotate(${rotation}deg)` }}>
          {prizes.map((p, i) => {
            const s = pt(i * SEG, R);
            const e = pt((i + 1) * SEG, R);
            const mid = i * SEG + SEG / 2;
            const lp = pt(mid, R * 0.6);
            return (
              <g key={i}>
                <path
                  d={`M ${C} ${C} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`}
                  fill={p.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                  stroke="#fff"
                  strokeWidth="1"
                />
                <text
                  x={lp.x}
                  y={lp.y}
                  fill="#fff"
                  fontSize="7.5"
                  fontWeight="700"
                  textAnchor="middle"
                  transform={`rotate(${mid} ${lp.x} ${lp.y})`}
                >
                  {p.short}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r="13" fill="#fff" />
          <circle cx={C} cy={C} r="13" fill="none" stroke="#e7ecd8" strokeWidth="1" />
        </svg>
      </div>

      {result === null ? (
        <button className="btn btn-primary wheel-spin" onClick={spin} disabled={spinning}>
          {spinning ? "Đang quay…" : "🎡 Quay ngay"}
        </button>
      ) : (
        <div className="wheel-result">
          <div className="wheel-prize">
            🎉 Chúc mừng! Bạn nhận được: <strong>{prizes[result].full}</strong>
          </div>
          <p className="wheel-claim-note">Để lại thông tin để trung tâm liên hệ trao ưu đãi nhé!</p>
          <LeadForm ctaText="Nhận ưu đãi" hideAgeSelect />
        </div>
      )}
    </div>
  );
}
