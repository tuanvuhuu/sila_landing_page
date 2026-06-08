"use client";

import { useEffect, useRef, useState } from "react";
import type { Chatbot, ChatTopic, FaqItem } from "@/lib/content";

import { getPersistedUtm } from "@/lib/utm";
import { fireTikTokEvent } from "@/components/TikTokPixel";

type Msg = { from: "bot" | "user"; text: string };
type Mode = "menu" | "answer" | "askName" | "askPhone" | "sending" | "done";
type Utm = Record<string, string>;

export default function ChatbotWidget({
  config,
  faq,
}: {
  config: Chatbot;
  faq: FaqItem[];
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [mode, setMode] = useState<Mode>("menu");
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [utm, setUtm] = useState<Utm>({});
  const msgsRef = useRef<HTMLDivElement>(null);

  // Thu thập UTM
  useEffect(() => {
    setUtm(getPersistedUtm());
  }, []);

  // Cuộn đầu khi chỉ có lời chào, cuộn cuối khi có hội thoại
  useEffect(() => {
    const el = msgsRef.current;
    if (!el) return;
    if (messages.length <= 1) {
      el.scrollTo({ top: 0, behavior: "instant" });
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, mode]);

  if (!config?.enabled) return null;

  const topics: ChatTopic[] = [
    ...(config.topics ?? []),
    ...(config.includeFaq ? (faq ?? []).map((f) => ({ label: f.q, answer: f.a })) : []),
  ];

  function openChat() {
    // Reset hoàn toàn mỗi lần mở — luôn bắt đầu sạch
    setMessages([{ from: "bot", text: config.greeting }]);
    setMode("menu");
    setInput("");
    setName("");
    setOpen(true);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
  }
  function pushBot(text: string) {
    setMessages((m) => [...m, { from: "bot", text }]);
  }

  function onTopic(t: ChatTopic) {
    pushUser(t.label);
    setMode("answer"); // ẩn menu chip lại
    setTimeout(() => pushBot(t.answer), 250);
  }

  function startLead() {
    pushUser(config.leadButtonLabel.replace(/^[^\p{L}]+/u, "").trim() || "Đăng ký tư vấn");
    setMode("askName");
    setTimeout(() => {
      if (config.leadPrompt) pushBot(config.leadPrompt);
      pushBot(config.leadAskName);
    }, 250);
  }

  async function submitLead(phone: string) {
    setMode("sending");
    const eventId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, ageGroup: "", utm, eventId }),
      });
      if (!res.ok) throw new Error();
      window.fbq?.("track", "Lead", { content_name: "Chatbot" }, { eventID: eventId });
      fireTikTokEvent("SubmitForm");
      pushBot(config.leadSuccess);
      setMode("done");
    } catch {
      pushBot("Xin lỗi, có lỗi khi gửi thông tin. Ba mẹ thử lại hoặc gọi trực tiếp giúp em nhé.");
      setMode("done");
    }
  }

  function sendInput() {
    const val = input.trim();
    if (!val) return;
    if (mode === "askName") {
      setName(val);
      pushUser(val);
      setInput("");
      setMode("askPhone");
      setTimeout(() => pushBot(config.leadAskPhone), 250);
      return;
    }
    if (mode === "askPhone") {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 8) {
        pushUser(val);
        setInput("");
        setTimeout(() => pushBot("Số điện thoại chưa hợp lệ, ba mẹ nhập lại giúp em nhé (VD: 0900000000)."), 250);
        return;
      }
      pushUser(val);
      setInput("");
      submitLead(val);
    }
  }

  function backToMenu() {
    setMode("menu");
    setTimeout(() => pushBot("Ba mẹ cần hỗ trợ thêm gì nữa không ạ?"), 200);
  }

  const showInput = mode === "askName" || mode === "askPhone";

  return (
    <div className="cb-fab">
      {open && (
        <div className="cb-window" role="dialog" aria-label={config.title}>
          <div className="cb-header">
            <span className="cb-header-title">{config.title}</span>
            <button className="cb-close" onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
          </div>

          <div className="cb-msgs" ref={msgsRef}>
            {messages.map((m, i) => (
              <div key={i} className={`cb-msg ${m.from}`}>{m.text}</div>
            ))}
            {mode === "sending" && <div className="cb-msg bot cb-typing">Đang gửi…</div>}
          </div>

          {/* Menu chủ đề: chỉ hiện khi đang ở chế độ menu */}
          {mode === "menu" && (
            <div className="cb-quick">
              {topics.map((t, i) => (
                <button key={i} className="cb-chip" onClick={() => onTopic(t)}>{t.label}</button>
              ))}
              {config.leadEnabled && (
                <button className="cb-chip cb-chip-lead" onClick={startLead}>{config.leadButtonLabel}</button>
              )}
            </div>
          )}

          {/* Sau khi xem câu trả lời hoặc gửi lead: chỉ nút Về menu */}
          {(mode === "answer" || mode === "done") && (
            <div className="cb-quick">
              <button className="cb-chip" onClick={backToMenu}>← Về menu chính</button>
            </div>
          )}

          {showInput && (
            <div className="cb-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendInput(); }}
                placeholder={mode === "askPhone" ? "Số điện thoại…" : "Nhập tại đây…"}
                inputMode={mode === "askPhone" ? "tel" : "text"}
                autoFocus
              />
              <button className="cb-send" onClick={sendInput} aria-label="Gửi">➤</button>
            </div>
          )}
        </div>
      )}

      <button
        className="cb-trigger"
        onClick={() => open ? setOpen(false) : openChat()}
        aria-label="Mở trợ lý tư vấn"
      >
        {open ? "✕" : "💬"}
        {!open && <span className="cb-dot" />}
      </button>
    </div>
  );
}
