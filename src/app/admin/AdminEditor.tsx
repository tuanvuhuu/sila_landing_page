"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, Testimonial, FaqItem, Stat, Feature, ChatTopic } from "@/lib/content";
import "./admin.css";

type Lead = {
  id: number;
  name: string;
  phone: string;
  ageGroup: string;
  status: string;
  utmSource: string;
  utmCampaign: string;
  createdAt: string;
};

type EventItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  endDate: string | null;
  location: string;
  ctaText: string;
  ctaLink: string;
  status: string;
};

const EMPTY_EVENT: Omit<EventItem, "id"> = {
  title: "", description: "", image: "", date: "", endDate: null,
  location: "", ctaText: "Đăng ký tham gia", ctaLink: "#signup", status: "draft",
};

const STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã gọi" },
  { value: "trial", label: "Đã học thử" },
  { value: "enrolled", label: "Đã ghi danh" },
  { value: "lost", label: "Không quan tâm" },
];

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload failed");
  const data = await res.json();
  return data.url as string;
}

export default function AdminEditor({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [c, setC] = useState<SiteContent>(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState("");

  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<(Omit<EventItem, "id"> & { id?: number }) | null>(null);
  const [eventSaving, setEventSaving] = useState(false);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLeads)
      .catch(() => setLeads([]));
    // Load events (all, including draft)
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      // Fetch all events (published + draft) for admin
      const res = await fetch("/api/events?all=1");
      if (res.ok) setEvents(await res.json());
    } catch { /* ignore */ }
  }

  async function saveEvent() {
    if (!editingEvent || !editingEvent.title || !editingEvent.date) {
      alert("Vui lòng nhập tiêu đề và ngày diễn ra");
      return;
    }
    setEventSaving(true);
    try {
      const method = editingEvent.id ? "PUT" : "POST";
      const body = editingEvent.id
        ? editingEvent
        : { ...editingEvent };
      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setEditingEvent(null);
      await loadEvents();
    } catch {
      alert("Lưu sự kiện thất bại");
    } finally {
      setEventSaving(false);
    }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Xóa sự kiện này?")) return;
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadEvents();
  }

  async function toggleEvent(ev: EventItem) {
    if (ev.status === "cancelled") return; // sự kiện đã huỷ: chỉnh trong popup
    const next = ev.status === "published" ? "draft" : "published";
    // Cập nhật lạc quan để UI phản hồi ngay
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? { ...e, status: next } : e)));
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ev.id, status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("Không đổi được trạng thái");
      await loadEvents(); // hoàn tác bằng cách tải lại
    }
  }

  async function uploadEventImage(file: File) {
    const url = await uploadFile(file);
    setEditingEvent((prev) => prev ? { ...prev, image: url } : prev);
  }

  function patch(updater: (draft: SiteContent) => void) {
    setC((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      alert("Lưu thất bại. Bạn đã đăng nhập chưa?");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function exportCSV() {
    const headers = ["Tên", "SĐT", "Độ tuổi", "Nguồn", "Campaign", "Trạng thái", "Thời gian"];
    const rows = leads.map((l) => [
      l.name, l.phone, l.ageGroup || "",
      l.utmSource || "", l.utmCampaign || "",
      STATUSES.find((s) => s.value === (l.status || "new"))?.label ?? l.status,
      new Date(l.createdAt).toLocaleString("vi-VN"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function updateStatus(id: number, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      alert("Cập nhật trạng thái thất bại.");
    }
  }

  async function onAddGalleryMultiple(files: FileList) {
    setGalleryUploading(true);
    const total = files.length;
    try {
      for (let i = 0; i < total; i++) {
        setGalleryProgress(`Đang tải ${i + 1}/${total}...`);
        const url = await uploadFile(files[i]);
        patch((d) => { d.gallery.push(url); });
      }
      setGalleryProgress(`✓ Đã tải ${total} ảnh`);
      setTimeout(() => setGalleryProgress(""), 2500);
    } catch {
      alert("Có lỗi khi tải ảnh lên, vui lòng thử lại.");
      setGalleryProgress("");
    } finally {
      setGalleryUploading(false);
    }
  }

  async function onHeroImage(file: File) {
    const url = await uploadFile(file);
    patch((d) => {
      d.hero.image = url;
    });
  }

  return (
    <div className="admin">
      <div className="admin-top">
        <div>
          <h1>Quản trị nội dung</h1>
          <p className="muted">Sửa nội dung, lưu lại là trang công khai cập nhật ngay.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <a className="abtn" href="/" target="_blank" rel="noreferrer">Xem trang ↗</a>
          <button className="abtn" onClick={logout}>Đăng xuất</button>
        </div>
      </div>

      <div className="card">
        <h2>Thông tin chung</h2>
        <div className="afield">
          <label>Tên trung tâm</label>
          <input value={c.centerName} onChange={(e) => patch((d) => { d.centerName = e.target.value; })} />
        </div>
      </div>

      <div className="card">
        <h2>Đầu trang (Hero)</h2>
        <div className="afield">
          <label>Badge thông báo nhỏ (eyebrow)</label>
          <input value={c.hero.eyebrow ?? ""} onChange={(e) => patch((d) => { d.hero.eyebrow = e.target.value; })} placeholder="🎓 Đang nhận học viên kỳ mới" />
        </div>
        <div className="afield">
          <label>Tiêu đề chính</label>
          <input value={c.hero.title} onChange={(e) => patch((d) => { d.hero.title = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Mô tả ngắn</label>
          <textarea value={c.hero.subtitle} onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Chữ trên nút kêu gọi</label>
          <input value={c.hero.ctaText} onChange={(e) => patch((d) => { d.hero.ctaText = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Ảnh đầu trang</label>
          <div className="thumbs">
            {c.hero.image && <img className="thumb" src={c.hero.image} alt="hero" />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onHeroImage(f); }} />
            {c.hero.image && (
              <button className="abtn" onClick={() => patch((d) => { d.hero.image = ""; })}>Xóa ảnh</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Số liệu nổi bật</h2>
        <div className="row2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {(c.stats ?? []).map((s: Stat, i: number) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <div className="afield" style={{ flex: "0 0 90px", marginBottom: 0 }}>
                <label>Con số</label>
                <input value={s.num} onChange={(e) => patch((d) => { d.stats[i].num = e.target.value; })} placeholder="VD: 2.000+" />
              </div>
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Nhãn</label>
                <input value={s.lbl} onChange={(e) => patch((d) => { d.stats[i].lbl = e.target.value; })} placeholder="VD: Học viên" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Vì sao chọn chúng tôi (4 điểm nổi bật)</h2>
        {(c.features ?? []).map((f: Feature, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="afield">
              <label>Tiêu đề điểm {i + 1}</label>
              <input value={f.title} onChange={(e) => patch((d) => { d.features[i].title = e.target.value; })} />
            </div>
            <div className="afield">
              <label>Mô tả</label>
              <textarea value={f.desc} onChange={(e) => patch((d) => { d.features[i].desc = e.target.value; })} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Chương trình học</h2>
        {c.programs.map((p, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="row2">
              <div className="afield">
                <label>Độ tuổi</label>
                <input value={p.age} onChange={(e) => patch((d) => { d.programs[i].age = e.target.value; })} />
              </div>
              <div className="afield">
                <label>Tên chương trình</label>
                <input value={p.title} onChange={(e) => patch((d) => { d.programs[i].title = e.target.value; })} />
              </div>
            </div>
            <div className="afield">
              <label>Mô tả</label>
              <textarea value={p.desc} onChange={(e) => patch((d) => { d.programs[i].desc = e.target.value; })} />
            </div>
            <button className="abtn" onClick={() => patch((d) => { d.programs.splice(i, 1); })}>Xóa chương trình</button>
          </div>
        ))}
        <button className="abtn" style={{ marginTop: "0.9rem" }} onClick={() => patch((d) => { d.programs.push({ age: "", title: "", desc: "" }); })}>
          + Thêm chương trình
        </button>
      </div>

      <div className="card">
        <h2>Đánh giá phụ huynh ({c.testimonials?.length || 0})</h2>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Nhập đúng tên & lời đánh giá thật. Upload ảnh chân dung phụ huynh để tăng độ tin cậy.
        </p>
        {(c.testimonials ?? []).map((t: Testimonial, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="row2">
              <div className="afield">
                <label>Tên phụ huynh</label>
                <input value={t.name} onChange={(e) => patch((d) => { d.testimonials[i].name = e.target.value; })} />
              </div>
              <div className="afield">
                <label>Vai trò (VD: Mẹ của bé 5 tuổi)</label>
                <input value={t.role} onChange={(e) => patch((d) => { d.testimonials[i].role = e.target.value; })} />
              </div>
            </div>
            <div className="afield">
              <label>Nội dung đánh giá</label>
              <textarea value={t.text} onChange={(e) => patch((d) => { d.testimonials[i].text = e.target.value; })} />
            </div>
            <div className="row2">
              <div className="afield">
                <label>Số sao</label>
                <select value={t.rating} onChange={(e) => patch((d) => { d.testimonials[i].rating = Number(e.target.value); })}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} sao {"★".repeat(n)}</option>
                  ))}
                </select>
              </div>
              <div className="afield">
                <label>Ảnh đại diện (tùy chọn)</label>
                <div className="thumbs">
                  {t.avatar && <img className="thumb" src={t.avatar} alt={t.name} />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await uploadFile(f);
                      patch((d) => { d.testimonials[i].avatar = url; });
                    }}
                  />
                  {t.avatar && (
                    <button className="abtn" onClick={() => patch((d) => { d.testimonials[i].avatar = ""; })}>Xóa ảnh</button>
                  )}
                </div>
              </div>
            </div>
            <button className="abtn" onClick={() => patch((d) => { d.testimonials.splice(i, 1); })}>Xóa đánh giá này</button>
          </div>
        ))}
        <button
          className="abtn"
          style={{ marginTop: "0.9rem" }}
          onClick={() => patch((d) => {
            d.testimonials = d.testimonials ?? [];
            d.testimonials.push({ name: "", role: "", text: "", rating: 5, avatar: "" });
          })}
        >
          + Thêm đánh giá
        </button>
      </div>

      <div className="card">
        <h2>Thư viện ảnh lớp học</h2>
        {c.gallery.length > 0 && (
          <div className="thumbs" style={{ marginBottom: "1rem" }}>
            {c.gallery.map((src, i) => (
              <span key={i} style={{ position: "relative", display: "inline-block" }}>
                <img className="thumb" src={src} alt={`gallery ${i}`} />
                <button
                  className="abtn"
                  style={{ position: "absolute", top: -6, right: -6, padding: "0 5px", fontSize: "0.75rem", lineHeight: "1.4", borderRadius: "50%", background: "#e24f4f", color: "#fff", border: "none", cursor: "pointer" }}
                  onClick={() => patch((d) => { d.gallery.splice(i, 1); })}
                  title="Xóa ảnh này"
                >✕</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <label className="abtn" style={{ cursor: galleryUploading ? "not-allowed" : "pointer", opacity: galleryUploading ? 0.6 : 1 }}>
            📷 Chọn ảnh (có thể chọn nhiều)
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={galleryUploading}
              style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.length) onAddGalleryMultiple(e.target.files); }}
            />
          </label>
          {galleryProgress && <span className="muted">{galleryProgress}</span>}
        </div>
        <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
          Giữ Ctrl (Windows) hoặc ⌘ (Mac) để chọn nhiều ảnh cùng lúc.
        </p>
      </div>

      <div className="card">
        <h2>Câu hỏi thường gặp (FAQ)</h2>
        {(c.faq ?? []).map((item: FaqItem, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="afield">
              <label>Câu hỏi</label>
              <input value={item.q} onChange={(e) => patch((d) => { d.faq[i].q = e.target.value; })} />
            </div>
            <div className="afield">
              <label>Câu trả lời</label>
              <textarea value={item.a} onChange={(e) => patch((d) => { d.faq[i].a = e.target.value; })} />
            </div>
            <button className="abtn" onClick={() => patch((d) => { d.faq.splice(i, 1); })}>Xóa câu hỏi này</button>
          </div>
        ))}
        <button
          className="abtn"
          style={{ marginTop: "0.9rem" }}
          onClick={() => patch((d) => {
            d.faq = d.faq ?? [];
            d.faq.push({ q: "", a: "" });
          })}
        >
          + Thêm câu hỏi
        </button>
      </div>

      <div className="card">
        <h2>Ưu đãi</h2>
        <div className="afield">
          <label>Tiêu đề ưu đãi</label>
          <input value={c.promo.title} onChange={(e) => patch((d) => { d.promo.title = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Mô tả ưu đãi</label>
          <textarea value={c.promo.desc} onChange={(e) => patch((d) => { d.promo.desc = e.target.value; })} />
        </div>
      </div>

      <div className="card">
        <h2>Liên hệ</h2>
        <div className="row2">
          <div className="afield">
            <label>Số điện thoại</label>
            <input value={c.contact.phone} onChange={(e) => patch((d) => { d.contact.phone = e.target.value; })} />
          </div>
          <div className="afield">
            <label>Email</label>
            <input value={c.contact.email} onChange={(e) => patch((d) => { d.contact.email = e.target.value; })} />
          </div>
        </div>
        <div className="afield">
          <label>Địa chỉ</label>
          <input value={c.contact.address} onChange={(e) => patch((d) => { d.contact.address = e.target.value; })} />
        </div>
        <div className="row2">
          <div className="afield">
            <label>Link Zalo (để trống nếu không dùng)</label>
            <input value={c.contact.zalo ?? ""} placeholder="https://zalo.me/0900000000" onChange={(e) => patch((d) => { d.contact.zalo = e.target.value; })} />
          </div>
          <div className="afield">
            <label>Link Messenger</label>
            <input value={c.contact.messenger ?? ""} placeholder="https://m.me/trangcuaban" onChange={(e) => patch((d) => { d.contact.messenger = e.target.value; })} />
          </div>
        </div>
        <div className="afield">
          <label>Link Facebook Page</label>
          <input value={c.contact.facebook ?? ""} placeholder="https://facebook.com/trangcuaban" onChange={(e) => patch((d) => { d.contact.facebook = e.target.value; })} />
        </div>
        <div className="row2">
          <div className="afield">
            <label>Facebook Page ID (Messenger chat plugin)</label>
            <input value={c.contact.fbPageId ?? ""} placeholder="VD: 123456789012345" onChange={(e) => patch((d) => { d.contact.fbPageId = e.target.value; })} />
            <small style={{ color: "#6b6480", fontSize: "0.8rem" }}>Vào Facebook Page → Settings → Page Info → Page ID</small>
          </div>
          <div className="afield">
            <label>Zalo OA ID (Zalo chat widget)</label>
            <input value={c.contact.zaloOAId ?? ""} placeholder="VD: 1234567890123456" onChange={(e) => patch((d) => { d.contact.zaloOAId = e.target.value; })} />
            <small style={{ color: "#6b6480", fontSize: "0.8rem" }}>Vào Zalo Official Account Manager → OA ID</small>
          </div>
        </div>
      </div>

      {/* ===== CHATBOT TƯ VẤN ===== */}
      <div className="card">
        <h2>Chatbot tư vấn 🤖</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontWeight: 700, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.chatbot.enabled}
            onChange={(e) => patch((d) => { d.chatbot.enabled = e.target.checked; })}
          />
          Bật chatbot trên trang chủ
        </label>
        <div className="afield">
          <label>Tiêu đề cửa sổ chat</label>
          <input value={c.chatbot.title} onChange={(e) => patch((d) => { d.chatbot.title = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Lời chào đầu</label>
          <textarea value={c.chatbot.greeting} onChange={(e) => patch((d) => { d.chatbot.greeting = e.target.value; })} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.chatbot.includeFaq}
            onChange={(e) => patch((d) => { d.chatbot.includeFaq = e.target.checked; })}
          />
          Tự động dùng các câu hỏi FAQ làm chủ đề
        </label>

        <h3 style={{ fontSize: "0.95rem", margin: "0.5rem 0 0.8rem" }}>Chủ đề (nút bấm)</h3>
        {(c.chatbot.topics ?? []).map((t: ChatTopic, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="afield">
              <label>Nhãn nút</label>
              <input value={t.label} onChange={(e) => patch((d) => { d.chatbot.topics[i].label = e.target.value; })} />
            </div>
            <div className="afield">
              <label>Câu trả lời</label>
              <textarea value={t.answer} onChange={(e) => patch((d) => { d.chatbot.topics[i].answer = e.target.value; })} />
            </div>
            <button className="abtn" onClick={() => patch((d) => { d.chatbot.topics.splice(i, 1); })}>Xóa chủ đề này</button>
          </div>
        ))}
        <button
          className="abtn"
          style={{ marginTop: "0.9rem" }}
          onClick={() => patch((d) => { d.chatbot.topics = d.chatbot.topics ?? []; d.chatbot.topics.push({ label: "", answer: "" }); })}
        >
          + Thêm chủ đề
        </button>

        <h3 style={{ fontSize: "0.95rem", margin: "1.4rem 0 0.8rem" }}>Thu thập thông tin (Lead)</h3>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.chatbot.leadEnabled}
            onChange={(e) => patch((d) => { d.chatbot.leadEnabled = e.target.checked; })}
          />
          Cho phép bot xin tên + SĐT (lưu vào danh sách Lead)
        </label>
        <div className="afield">
          <label>Nhãn nút đăng ký</label>
          <input value={c.chatbot.leadButtonLabel} onChange={(e) => patch((d) => { d.chatbot.leadButtonLabel = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Câu mời để lại thông tin</label>
          <textarea value={c.chatbot.leadPrompt} onChange={(e) => patch((d) => { d.chatbot.leadPrompt = e.target.value; })} />
        </div>
        <div className="row2">
          <div className="afield">
            <label>Câu hỏi xin tên</label>
            <textarea value={c.chatbot.leadAskName} onChange={(e) => patch((d) => { d.chatbot.leadAskName = e.target.value; })} />
          </div>
          <div className="afield">
            <label>Câu hỏi xin SĐT</label>
            <textarea value={c.chatbot.leadAskPhone} onChange={(e) => patch((d) => { d.chatbot.leadAskPhone = e.target.value; })} />
          </div>
        </div>
        <div className="afield">
          <label>Câu cảm ơn sau khi gửi</label>
          <textarea value={c.chatbot.leadSuccess} onChange={(e) => patch((d) => { d.chatbot.leadSuccess = e.target.value; })} />
        </div>
      </div>

      {/* ===== SỰ KIỆN ===== */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Sự kiện ({events.length})</h2>
          <button className="abtn" onClick={() => setEditingEvent({ ...EMPTY_EVENT })}>+ Thêm sự kiện</button>
        </div>

        {/* Modal tạo/sửa sự kiện */}
        {editingEvent && (
          <div className="ev-modal">
            <div className="ev-modal-content">
              <h3>{editingEvent.id ? "Sửa sự kiện" : "Tạo sự kiện mới"}</h3>
              <div className="afield">
                <label>Tiêu đề *</label>
                <input value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} placeholder="VD: Ngày hội Open Day tháng 7" />
              </div>
              <div className="afield">
                <label>Mô tả</label>
                <textarea rows={3} value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} placeholder="Mô tả chi tiết sự kiện..." />
              </div>
              <div className="row2">
                <div className="afield">
                  <label>Ngày diễn ra *</label>
                  <input type="date" value={editingEvent.date ? editingEvent.date.slice(0, 10) : ""} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value ? new Date(e.target.value).toISOString() : "" })} />
                </div>
                <div className="afield">
                  <label>Ngày kết thúc (nếu nhiều ngày)</label>
                  <input type="date" value={editingEvent.endDate ? editingEvent.endDate.slice(0, 10) : ""} onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
              <div className="afield">
                <label>Địa điểm</label>
                <input value={editingEvent.location} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} placeholder="VD: 123 Đường ABC, Quận 1" />
              </div>
              <div className="afield">
                <label>Ảnh bìa</label>
                {editingEvent.image && <img src={editingEvent.image} alt="preview" style={{ width: 200, borderRadius: 8, marginBottom: 8 }} />}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadEventImage(e.target.files[0])} />
              </div>
              <div className="row2">
                <div className="afield">
                  <label>Chữ trên nút CTA</label>
                  <input value={editingEvent.ctaText} onChange={(e) => setEditingEvent({ ...editingEvent, ctaText: e.target.value })} placeholder="Đăng ký tham gia" />
                </div>
                <div className="afield">
                  <label>Link CTA</label>
                  <input value={editingEvent.ctaLink} onChange={(e) => setEditingEvent({ ...editingEvent, ctaLink: e.target.value })} placeholder="#signup hoặc https://forms.gle/..." />
                </div>
              </div>
              <div className="afield">
                <label>Trạng thái</label>
                <select value={editingEvent.status} onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}>
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="cancelled">Đã huỷ</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.7rem", marginTop: "1rem" }}>
                <button className="abtn abtn-primary" onClick={saveEvent} disabled={eventSaving}>
                  {eventSaving ? "Đang lưu..." : "Lưu sự kiện"}
                </button>
                <button className="abtn" onClick={() => setEditingEvent(null)}>Huỷ</button>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách sự kiện */}
        {events.length === 0 ? (
          <p className="muted">Chưa có sự kiện nào. Bấm "+ Thêm sự kiện" để tạo.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", background: "#f8f9f6", borderRadius: 12, border: "1px solid var(--line)" }}>
                {ev.image && <img src={ev.image} alt="" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 8 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{ev.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    📅 {new Date(ev.date).toLocaleDateString("vi-VN")} ·
                    <span style={{ color: ev.status === "published" ? "var(--green)" : ev.status === "cancelled" ? "#dc3545" : "var(--orange)", fontWeight: 600 }}>
                      {ev.status === "published" ? "Đang hiện" : ev.status === "cancelled" ? "Đã huỷ" : "Đang ẩn"}
                    </span>
                  </div>
                </div>
                {ev.status === "cancelled" ? (
                  <span className="ev-toggle-cancelled" title="Mở 'Sửa' để đổi trạng thái">Đã huỷ</span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ev.status === "published"}
                    className={`ev-toggle${ev.status === "published" ? " on" : ""}`}
                    onClick={() => toggleEvent(ev)}
                    title={ev.status === "published" ? "Đang hiện trên trang chủ — bấm để ẩn" : "Đang ẩn — bấm để hiện"}
                  >
                    <span className="ev-toggle-knob" />
                    <span className="ev-toggle-label">{ev.status === "published" ? "Bật" : "Tắt"}</span>
                  </button>
                )}
                <button className="abtn" onClick={() => setEditingEvent(ev)} style={{ fontSize: "0.82rem" }}>Sửa</button>
                <button className="abtn" onClick={() => deleteEvent(ev.id)} style={{ fontSize: "0.82rem", color: "#dc3545" }}>Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Khách đăng ký ({leads.length})</h2>
          {leads.length > 0 && (
            <button className="abtn" onClick={exportCSV}>⬇ Xuất Excel (.csv)</button>
          )}
        </div>
        {leads.length > 0 && (
          <div className="lead-stats">
            {STATUSES.map((s) => {
              const count = leads.filter((l) => (l.status || "new") === s.value).length;
              return (
                <div className="lstat" key={s.value}>
                  <span className="lstat-n">{count}</span>
                  <span className="lstat-l">{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
        {leads.length === 0 ? (
          <p className="muted">Chưa có ai đăng ký. Khi phụ huynh điền form, dữ liệu sẽ hiện ở đây.</p>
        ) : (
          <div>
            <div className="lead-row h">
              <span>Tên</span><span>SĐT</span><span>Tuổi</span><span>Nguồn</span><span>Trạng thái</span><span>Thời gian</span>
            </div>
            {leads.map((l) => (
              <div className="lead-row" key={l.id}>
                <span>{l.name}</span>
                <span>{l.phone}</span>
                <span>{l.ageGroup || "—"}</span>
                <span>{l.utmSource ? l.utmSource + (l.utmCampaign ? " · " + l.utmCampaign : "") : "—"}</span>
                <span>
                  <select value={l.status || "new"} onChange={(e) => updateStatus(l.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </span>
                <span>{new Date(l.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="save-bar">
        <button className="abtn abtn-primary" onClick={save} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {saved && <span className="saved-msg">✓ Đã lưu</span>}
      </div>
    </div>
  );
}
