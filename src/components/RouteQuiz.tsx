"use client";

import { useState } from "react";

const QUESTIONS = [
  { key: "age", q: "Bé nhà mình bao nhiêu tuổi?", opts: ["3–4 tuổi", "5–7 tuổi", "8–10 tuổi", "11–15 tuổi"] },
  { key: "level", q: "Trình độ tiếng Anh hiện tại của bé?", opts: ["Mới bắt đầu", "Đã học cơ bản", "Giao tiếp khá"] },
  { key: "goal", q: "Ba mẹ mong muốn điều gì nhất?", opts: ["Giao tiếp tự tin", "Luyện thi Cambridge / KET-PET", "Nền tảng toàn diện"] },
];

function recommend(age: string): { title: string; desc: string } {
  switch (age) {
    case "3–4 tuổi":
      return { title: "Mầm non làm quen", desc: "Tiếp xúc tiếng Anh tự nhiên qua bài hát, câu chuyện và trò chơi vận động." };
    case "5–7 tuổi":
      return { title: "Khám phá tiểu học", desc: "Xây nền phát âm chuẩn, bắt đầu đọc – viết và giao tiếp theo chủ đề." };
    case "8–10 tuổi":
      return { title: "Tự tin hội nhập", desc: "Thành thạo 4 kỹ năng, luyện thi Cambridge Starters/Movers/Flyers." };
    default:
      return { title: "Trung học vững vàng", desc: "Củng cố ngữ pháp – từ vựng, luyện thi KET/PET và kỹ năng thuyết trình." };
  }
}

export default function RouteQuiz() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});

  const done = step >= QUESTIONS.length;
  const progress = Math.round((Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100);

  function pick(key: string, value: string) {
    setAns((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  }
  function reset() {
    setAns({});
    setStep(0);
  }

  const rec = done ? recommend(ans.age) : null;

  return (
    <div className="quiz-card">
      {!done ? (
        <>
          <div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="quiz-step-label">Câu {step + 1}/{QUESTIONS.length}</div>
          <h3 className="quiz-q">{QUESTIONS[step].q}</h3>
          <div className="quiz-opts">
            {QUESTIONS[step].opts.map((opt) => (
              <button key={opt} type="button" className="quiz-opt" onClick={() => pick(QUESTIONS[step].key, opt)}>
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="quiz-result">
          <span className="quiz-result-badge">✅ Lộ trình gợi ý cho bé</span>
          <h3>{rec!.title}</h3>
          <p className="quiz-result-meta">{ans.age} · {ans.level} · {ans.goal}</p>
          <p>{rec!.desc}</p>
          <div className="quiz-actions">
            <a href="#signup" className="btn btn-primary">Đăng ký học thử →</a>
            <button type="button" className="btn btn-ghost" onClick={reset}>Làm lại</button>
          </div>
        </div>
      )}
    </div>
  );
}
