"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPersistedUtm } from "@/lib/utm";
import { fireTikTokEvent } from "@/components/TikTokPixel";

type Utm = Record<string, string>;

const AGE_OPTIONS = [
  { value: "3–4 tuổi", emoji: "🧸" },
  { value: "5–7 tuổi", emoji: "✏️" },
  { value: "8–10 tuổi", emoji: "🎒" },
  { value: "Trên 10 tuổi", emoji: "🎓" },
];

export default function LeadForm({
  ctaText,
  initialAgeGroup = "",
  hideAgeSelect = false,
}: {
  ctaText: string;
  initialAgeGroup?: string;
  hideAgeSelect?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ageGroup, setAgeGroup] = useState(initialAgeGroup);
  const [company, setCompany] = useState(""); // honeypot — bot điền, người thật không thấy
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [utm, setUtm] = useState<Utm>({});
  const startedRef = useRef(false);

  // Kiểm tra số điện thoại Việt Nam (di động 0xxxxxxxxx hoặc +84xxxxxxxxx)
  function isValidVnPhone(raw: string) {
    const digits = raw.replace(/[^\d+]/g, "");
    return /^0\d{9}$/.test(digits) || /^\+?84\d{9}$/.test(digits);
  }

  useEffect(() => {
    setUtm(getPersistedUtm());
  }, []);

  function onStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    window.fbq?.("trackCustom", "StartForm");
  }

  async function submit() {
    if (!name || !phone) {
      setError("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    if (!isValidVnPhone(phone)) {
      setError("Số điện thoại chưa đúng. Vui lòng nhập số di động Việt Nam (VD: 0901234567).");
      return;
    }
    setLoading(true);
    setError("");
    const eventId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, ageGroup, utm, eventId, company }),
      });
      if (!res.ok) throw new Error();
      window.fbq?.("track", "Lead", { content_name: "Dang ky hoc thu" }, { eventID: eventId });
      fireTikTokEvent("SubmitForm");
      // Chuyển sang trang cảm ơn riêng
      router.push("/cam-on");
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="field">
        <label>Tên phụ huynh *</label>
        <input value={name} onFocus={onStart} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn A" />
      </div>
      <div className="field">
        <label>Số điện thoại *</label>
        <input value={phone} onFocus={onStart} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0900 000 000" />
      </div>
      {!hideAgeSelect && (
        <div className="field">
          <label>Độ tuổi của bé</label>
          <div className="age-pills" role="group" aria-label="Độ tuổi của bé">
            {AGE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`age-pill${ageGroup === opt.value ? " active" : ""}`}
                aria-pressed={ageGroup === opt.value}
                onClick={() => {
                  onStart();
                  setAgeGroup(ageGroup === opt.value ? "" : opt.value);
                }}
              >
                <span className="age-emo">{opt.emoji}</span>
                <span>{opt.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Honeypot: ẩn với người dùng, chỉ bot tự điền */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {error && <p className="form-error">⚠️ {error}</p>}
      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        {loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" /> Đang gửi...
          </>
        ) : (
          `🚀 ${ctaText}`
        )}
      </button>
      <p className="form-note">🔒 Thông tin được bảo mật — trung tâm sẽ gọi lại trong 24h.</p>
    </div>
  );
}
