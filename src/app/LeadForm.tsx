"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPersistedUtm } from "@/lib/utm";
import { fireTikTokEvent } from "@/components/TikTokPixel";

type Utm = Record<string, string>;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [utm, setUtm] = useState<Utm>({});
  const startedRef = useRef(false);

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
        body: JSON.stringify({ name, phone, ageGroup, utm, eventId }),
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
          <select value={ageGroup} onFocus={onStart} onChange={(e) => setAgeGroup(e.target.value)}>
            <option value="">— Chọn độ tuổi —</option>
            <option>3–4 tuổi</option>
            <option>5–7 tuổi</option>
            <option>8–10 tuổi</option>
          </select>
        </div>
      )}
      {error && <p style={{ color: "#e24f4f", fontWeight: 700, marginBottom: "0.6rem" }}>{error}</p>}
      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        {loading ? "Đang gửi..." : `🚀 ${ctaText}`}
      </button>
    </div>
  );
}
