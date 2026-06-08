"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, Testimonial, FaqItem, Stat, Feature, ChatTopic } from "@/lib/content";
import { Btn, BtnDel, BtnAdd, TextInput, TextArea, SelectInput, FileUpload, DateInput, ToastProvider, useToast } from "./ui";
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
  images: string; // JSON array of additional image URLs
  date: string;
  endDate: string | null;
  location: string;
  ctaText: string;
  ctaLink: string;
  status: string;
};

const EMPTY_EVENT: Omit<EventItem, "id"> = {
  title: "", description: "", image: "", images: "[]", date: "", endDate: null,
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Upload thất bại");
  }
  return data.url as string;
}

function AdminEditorInner({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [c, setC] = useState<SiteContent>(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isDirty = useRef(false);

  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<(Omit<EventItem, "id"> & { id?: number }) | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // New feature states
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(false);

  const CONTENT_TABS = ["hero", "programs", "reviews", "faq", "contact", "chatbot"];

  const TABS = [
    { id: "dashboard", icon: "📊", label: "Tổng quan" },
    { id: "hero", icon: "🏠", label: "Trang chủ" },
    { id: "programs", icon: "📚", label: "Chương trình" },
    { id: "reviews", icon: "⭐", label: "Đánh giá" },
    { id: "faq", icon: "❓", label: "FAQ & Ưu đãi" },
    { id: "contact", icon: "📞", label: "Liên hệ" },
    { id: "chatbot", icon: "🤖", label: "Chatbot" },
    { id: "events", icon: "🎉", label: "Sự kiện", badge: events.length },
    { id: "leads", icon: "👥", label: "Khách hàng", badge: leads.length },
  ];

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    if (leadFilter !== "all" && (l.status || "new") !== leadFilter) return false;
    if (leadSearch) {
      const q = leadSearch.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.phone.includes(q);
    }
    return true;
  });

  // Dashboard stats
  const dashStats = {
    totalLeads: leads.length,
    newToday: leads.filter((l) => {
      const d = new Date(l.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    byStatus: STATUSES.map((s) => ({
      ...s,
      count: leads.filter((l) => (l.status || "new") === s.value).length,
    })),
    totalEvents: events.length,
    activeEvents: events.filter((e) => e.status === "published").length,
  };

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLeads)
      .catch(() => setLeads([]));
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
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
    try {
      const url = await uploadFile(file);
      setEditingEvent((prev) => prev ? { ...prev, image: url } : prev);
    } catch (err) {
      alert(`Lỗi upload ảnh: ${err instanceof Error ? err.message : "Không xác định"}`);
    }
  }

  async function uploadEventExtraImage(file: File) {
    try {
      const url = await uploadFile(file);
      setEditingEvent((prev) => {
        if (!prev) return prev;
        const arr: string[] = JSON.parse(prev.images || "[]");
        return { ...prev, images: JSON.stringify([...arr, url]) };
      });
    } catch (err) {
      alert(`Lỗi upload ảnh: ${err instanceof Error ? err.message : "Không xác định"}`);
    }
  }

  function removeEventExtraImage(idx: number) {
    setEditingEvent((prev) => {
      if (!prev) return prev;
      const arr: string[] = JSON.parse(prev.images || "[]");
      arr.splice(idx, 1);
      return { ...prev, images: JSON.stringify(arr) };
    });
  }

  function patch(updater: (draft: SiteContent) => void) {
    setC((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
    setSaved(false);
    isDirty.current = true;
  }

  // Move item up/down in array
  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    if (to < 0 || to >= arr.length) return arr;
    const clone = [...arr];
    const [item] = clone.splice(from, 1);
    clone.splice(to, 0, item);
    return clone;
  }

  // Collapsible card toggle
  function toggleCard(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const { toast } = useToast();

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
      isDirty.current = false;
      toast("Đã lưu thành công!", "success");
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch {
      toast("Lưu thất bại. Bạn đã đăng nhập chưa?", "error");
    } finally {
      setSaving(false);
    }
  }

  // Warn on page leave with unsaved changes
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Tab switch with unsaved changes warning
  function switchTab(id: string) {
    if (isDirty.current && CONTENT_TABS.includes(activeTab)) {
      if (!confirm("Bạn có thay đổi chưa lưu. Chuyển tab sẽ mất dữ liệu. Tiếp tục?")) return;
    }
    setActiveTab(id);
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
    <div className={`admin${darkMode ? " dark" : ""}`}>
      <div className="admin-editor">
      <div className="admin-top">
        <div>
          <h1>Quản trị nội dung</h1>
          <p className="muted">Sửa nội dung, lưu lại là trang công khai cập nhật ngay.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <button className="abtn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Sáng" : "Tối"} style={{ padding: "0.4rem 0.7rem" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <a className="abtn" href="/" target="_blank" rel="noreferrer">Xem trang ↗</a>
          <Btn onClick={logout}>Đăng xuất</Btn>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`admin-tab${activeTab === t.id ? " active" : ""}`} onClick={() => switchTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
            {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
      <div className="dashboard">
        <div className="dash-welcome">
          <h2>👋 Xin chào! Đây là tổng quan trung tâm <strong>{c.centerName}</strong></h2>
        </div>

        <div className="dash-grid">
          <div className="dash-card dc-green">
            <div className="dash-icon">👥</div>
            <div className="dash-num">{dashStats.totalLeads}</div>
            <div className="dash-label">Tổng khách đăng ký</div>
          </div>
          <div className="dash-card dc-orange">
            <div className="dash-icon">🔥</div>
            <div className="dash-num">{dashStats.newToday}</div>
            <div className="dash-label">Mới hôm nay</div>
          </div>
          <div className="dash-card dc-blue">
            <div className="dash-icon">🎉</div>
            <div className="dash-num">{dashStats.totalEvents}</div>
            <div className="dash-label">Sự kiện</div>
          </div>
          <div className="dash-card dc-purple">
            <div className="dash-icon">✅</div>
            <div className="dash-num">{dashStats.activeEvents}</div>
            <div className="dash-label">Đang hoạt động</div>
          </div>
        </div>

        <div className="dash-row">
          <div className="card dash-status-card">
            <h2>📊 Phễu khách hàng</h2>
            <div className="dash-funnel">
              {dashStats.byStatus.map((s) => {
                const pct = dashStats.totalLeads > 0 ? Math.round((s.count / dashStats.totalLeads) * 100) : 0;
                return (
                  <div key={s.value} className="dash-funnel-row">
                    <span className="df-label">{s.label}</span>
                    <div className="df-bar-wrap">
                      <div className="df-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="df-count">{s.count}</span>
                    <span className="df-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card dash-actions-card">
            <h2>⚡ Truy cập nhanh</h2>
            <div className="dash-actions">
              <button className="dash-action-btn" onClick={() => switchTab("hero")}>🏠 Sửa trang chủ</button>
              <button className="dash-action-btn" onClick={() => switchTab("programs")}>📚 Chương trình</button>
              <button className="dash-action-btn" onClick={() => switchTab("leads")}>👥 Xem khách hàng</button>
              <button className="dash-action-btn" onClick={() => switchTab("events")}>🎉 Quản lý sự kiện</button>
              <button className="dash-action-btn" onClick={() => switchTab("chatbot")}>🤖 Cài chatbot</button>
              <button className="dash-action-btn" onClick={() => switchTab("faq")}>❓ FAQ & Ưu đãi</button>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === "hero" && (<>
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
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.hero.image = ""; })} title="Xóa ảnh">🗑 Xóa</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Số liệu nổi bật ({(c.stats ?? []).length})</h2>
        <div className="row2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {(c.stats ?? []).map((s: Stat, i: number) => (
            <div key={i} className="item-header">
              <div className="afield" style={{ flex: "0 0 90px", marginBottom: 0 }}>
                <label>Con số</label>
                <input value={s.num} onChange={(e) => patch((d) => { d.stats[i].num = e.target.value; })} placeholder="VD: 2.000+" />
              </div>
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Nhãn</label>
                <input value={s.lbl} onChange={(e) => patch((d) => { d.stats[i].lbl = e.target.value; })} placeholder="VD: Học viên" />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.stats.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
          ))}
        </div>
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.stats = d.stats ?? []; d.stats.push({ num: "", lbl: "" }); })}>＋ Thêm mới</button>
      </div>

      <div className="card">
        <h2>Vì sao chọn chúng tôi ({(c.features ?? []).length} điểm nổi bật)</h2>
        {(c.features ?? []).map((f: Feature, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Tiêu đề điểm {i + 1}</label>
                <input value={f.title} onChange={(e) => patch((d) => { d.features[i].title = e.target.value; })} />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.features.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Mô tả</label>
              <textarea value={f.desc} onChange={(e) => patch((d) => { d.features[i].desc = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.features = d.features ?? []; d.features.push({ title: "", desc: "" }); })}>＋ Thêm mới</button>
      </div>
      </>)}

      {activeTab === "programs" && (<>
      <div className="card">
        <h2>Chương trình học</h2>
        {c.programs.map((p, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="row2" style={{ flex: 1 }}>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Độ tuổi</label>
                  <input value={p.age} onChange={(e) => patch((d) => { d.programs[i].age = e.target.value; })} />
                </div>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên chương trình</label>
                  <input value={p.title} onChange={(e) => patch((d) => { d.programs[i].title = e.target.value; })} />
                </div>
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.programs.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Mô tả</label>
              <textarea value={p.desc} onChange={(e) => patch((d) => { d.programs[i].desc = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.programs.push({ age: "", title: "", desc: "" }); })}>＋ Thêm mới</button>
      </div>
      </>)}

      {activeTab === "reviews" && (<>
      <div className="card">
        <h2>Đánh giá phụ huynh ({c.testimonials?.length || 0})</h2>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Nhập đúng tên & lời đánh giá thật. Upload ảnh chân dung phụ huynh để tăng độ tin cậy.
        </p>
        {(c.testimonials ?? []).map((t: Testimonial, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="row2" style={{ flex: 1 }}>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên phụ huynh</label>
                  <input value={t.name} onChange={(e) => patch((d) => { d.testimonials[i].name = e.target.value; })} />
                </div>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Vai trò (VD: Mẹ của bé 5 tuổi)</label>
                  <input value={t.role} onChange={(e) => patch((d) => { d.testimonials[i].role = e.target.value; })} />
                </div>
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.testimonials.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
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
                    <button className="abtn abtn-del" onClick={() => patch((d) => { d.testimonials[i].avatar = ""; })} title="Xóa ảnh">🗑</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.testimonials = d.testimonials ?? []; d.testimonials.push({ name: "", role: "", text: "", rating: 5, avatar: "" }); })}>＋ Thêm mới</button>
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
      </>)}

      {activeTab === "faq" && (<>
      <div className="card">
        <h2>Câu hỏi thường gặp (FAQ)</h2>
        {(c.faq ?? []).map((item: FaqItem, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Câu hỏi</label>
                <input value={item.q} onChange={(e) => patch((d) => { d.faq[i].q = e.target.value; })} />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.faq.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Câu trả lời</label>
              <textarea value={item.a} onChange={(e) => patch((d) => { d.faq[i].a = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.faq = d.faq ?? []; d.faq.push({ q: "", a: "" }); })}>＋ Thêm mới</button>
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
      </>)}

      {activeTab === "contact" && (<>
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
      </>)}

      {/* ===== CHATBOT TƯ VẤN ===== */}
      {activeTab === "chatbot" && (<>
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
            <div className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Nhãn nút</label>
                <input value={t.label} onChange={(e) => patch((d) => { d.chatbot.topics[i].label = e.target.value; })} />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.chatbot.topics.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Câu trả lời</label>
              <textarea value={t.answer} onChange={(e) => patch((d) => { d.chatbot.topics[i].answer = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.chatbot.topics = d.chatbot.topics ?? []; d.chatbot.topics.push({ label: "", answer: "" }); })}>＋ Thêm mới</button>

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

      </>)}

      {/* ===== SỰ KIỆN ===== */}
      {activeTab === "events" && (<>
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
                <textarea rows={7} value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} placeholder="Mô tả chi tiết sự kiện..." />
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
              <div className="row2">
                <div className="afield">
                  <label>Ảnh bìa</label>
                  {editingEvent.image && <img src={editingEvent.image} alt="preview" style={{ width: "100%", maxWidth: 200, borderRadius: 8, marginBottom: 8, display: "block" }} />}
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadEventImage(e.target.files[0])} />
                </div>
                <div className="afield">
                  <label>Ảnh khác (gallery)</label>
                  <div className="ev-img-gallery">
                    {(JSON.parse(editingEvent.images || "[]") as string[]).map((url, idx) => (
                      <div key={idx} className="ev-img-thumb">
                        <img src={url} alt={`ảnh ${idx + 1}`} />
                        <button onClick={() => removeEventExtraImage(idx)} title="Xoá">✕</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" accept="image/*" multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach((f) => uploadEventExtraImage(f));
                      e.target.value = "";
                    }}
                  />
                  <small style={{ color: "var(--muted)", display: "block", marginTop: 4 }}>Chọn nhiều ảnh cùng lúc được</small>
                </div>
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

      </>)}

      {activeTab === "leads" && (<>
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
        {leads.length > 0 && (
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
            <input
              placeholder="🔍 Tìm tên hoặc SĐT..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: 9, fontSize: "0.9rem", fontFamily: "inherit", background: "#fbfaf7" }}
            />
            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              style={{ padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: 9, fontSize: "0.9rem", fontFamily: "inherit", background: "#fbfaf7" }}
            >
              <option value="all">Tất cả ({leads.length})</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label} ({leads.filter((l) => (l.status || "new") === s.value).length})</option>
              ))}
            </select>
          </div>
        )}
        {leads.length === 0 ? (
          <p className="muted">Chưa có ai đăng ký. Khi phụ huynh điền form, dữ liệu sẽ hiện ở đây.</p>
        ) : filteredLeads.length === 0 ? (
          <p className="muted">Không tìm thấy kết quả phù hợp.</p>
        ) : (
          <div className="lead-table-wrap">
            <div className="lead-row h">
              <span>Tên</span><span>SĐT</span><span>Tuổi</span><span>Nguồn</span><span>Trạng thái</span><span>Thời gian</span>
            </div>
            {filteredLeads.map((l) => (
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
      </>)}

      {CONTENT_TABS.includes(activeTab) && (
      <div className="save-bar">
        <Btn variant="primary" onClick={save} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Btn>
        {saved && <span className="saved-msg">✓ Đã lưu</span>}

      </div>
      )}
      </div>

      <div className="admin-preview">
        <div className="admin-preview-header">
          <span>👁 Xem trước</span>
          <button className="abtn" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }} onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}>↻ Tải lại</button>
        </div>
        <iframe ref={iframeRef} src="/" title="Preview" />
      </div>
    </div>
  );
}

export default function AdminEditor({ initial }: { initial: SiteContent }) {
  return (
    <ToastProvider>
      <AdminEditorInner initial={initial} />
    </ToastProvider>
  );
}
