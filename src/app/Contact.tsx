"use client";

import { useState, useRef, useEffect } from "react";

function fireContact(method: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", { method });
  }
}

// Link liên hệ thường (dùng cho số điện thoại ở thanh menu, chân trang)
export function ContactLink({
  href,
  method,
  className,
  children,
}: {
  href: string;
  method: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => fireContact(method)}>
      {children}
    </a>
  );
}

// Icon SVG components cho các kênh liên hệ
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M6.6 10.8a13.4 13.4 0 0 0 6.6 6.6l2.2-2.2a.9.9 0 0 1 .9-.2 10.2 10.2 0 0 0 3.2.5.9.9 0 0 1 .9.9V20a.9.9 0 0 1-.9.9A15.1 15.1 0 0 1 3.1 4.5a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9 10.2 10.2 0 0 0 .5 3.2.9.9 0 0 1-.2.9z" fill="#fff"/>
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <text x="3" y="18" fontFamily="Quicksand, sans-serif" fontWeight="700" fontSize="14" fill="#fff">Zalo</text>
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9a11 11 0 0 0 2.9.4c5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1.1 12.4-2.5-2.7L5.3 14.4l5.7-6.1 2.5 2.7 5.2-2.7z" fill="#fff"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="#fff"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CallCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.1 2 2 0 0 1 4 2.1h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.8 2.1z" fill="#fff"/>
    </svg>
  );
}

// Nút Call Center nổi ở góc dưới phải — bấm vào mở popup danh sách liên hệ
export function ContactButtons({
  phone,
  zalo,
  messenger,
  facebook,
}: {
  phone?: string;
  zalo?: string;
  messenger?: string;
  facebook?: string;
}) {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleMouseEnter() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    // Delay nhỏ để tránh đóng khi di chuột từ nút sang popup
    hoverTimeout.current = setTimeout(() => setOpen(false), 300);
  }

  const tel = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  // Luôn hiển thị tất cả các kênh liên hệ — dùng link mặc định nếu chưa cấu hình
  const channels: { key: string; href: string; icon: React.ReactNode; label: string; className: string; target?: string }[] = [];

  if (tel) {
    channels.push({ key: "phone", href: tel, icon: <PhoneIcon />, label: `Gọi ${phone}`, className: "cc-item cc-phone" });
  }
  channels.push({
    key: "zalo",
    href: zalo || (phone ? `https://zalo.me/${phone.replace(/\s/g, "")}` : "#"),
    icon: <ZaloIcon />, label: "Nhắn Zalo", className: "cc-item cc-zalo", target: "_blank",
  });
  channels.push({
    key: "facebook",
    href: facebook || "#",
    icon: <FacebookIcon />, label: "Facebook", className: "cc-item cc-facebook", target: "_blank",
  });
  if (messenger) {
    channels.push({ key: "messenger", href: messenger, icon: <MessengerIcon />, label: "Messenger", className: "cc-item cc-messenger", target: "_blank" });
  }

  return (
    <div
      className="cc-fab"
      ref={fabRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Popup menu */}
      <div className={`cc-popup${open ? " cc-popup-open" : ""}`}>
        <div className="cc-popup-header">
          <span>Liên hệ với chúng tôi</span>
        </div>
        <div className="cc-popup-list">
          {channels.map((ch, i) => (
            <a
              key={ch.key}
              href={ch.href}
              className={ch.className}
              target={ch.target}
              rel={ch.target ? "noreferrer" : undefined}
              onClick={() => { fireContact(ch.key); setOpen(false); }}
              style={{ animationDelay: open ? `${i * 0.05}s` : "0s" }}
            >
              <span className="cc-item-icon">{ch.icon}</span>
              <span className="cc-item-label">{ch.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Nút chính */}
      <button
        className={`cc-trigger${open ? " cc-trigger-open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Liên hệ"
      >
        <span className="cc-trigger-icon cc-icon-phone"><CallCenterIcon /></span>
        <span className="cc-trigger-icon cc-icon-close"><CloseIcon /></span>
      </button>
    </div>
  );
}
