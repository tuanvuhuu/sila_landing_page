"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Sai mật khẩu, thử lại nhé.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin">
      <div className="card login-box">
        <h1>Đăng nhập quản trị</h1>
        <p className="muted" style={{ marginBottom: "1.2rem" }}>
          Nhập mật khẩu admin (đặt trong file .env).
        </p>
        <div className="afield">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>
        {error && <p style={{ color: "#e24f4f", fontWeight: 700, marginBottom: "0.8rem" }}>{error}</p>}
        <button className="abtn abtn-primary" onClick={login} disabled={loading}>
          {loading ? "Đang vào..." : "Đăng nhập"}
        </button>
      </div>
    </div>
  );
}
