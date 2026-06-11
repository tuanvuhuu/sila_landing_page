// Quản lý "site" cho mô hình nhiều trang dùng chung 1 database.
//
// - Mỗi deployment công khai đặt biến môi trường SITE_KEY để biết mình là site nào.
//   (VD trên Vercel: SITE_KEY=esl-q7). Không đặt -> "default" (tương thích dữ liệu cũ).
// - Trang admin không phụ thuộc SITE_KEY: admin quản tất cả site, chọn site qua tham số.

export const DEFAULT_SITE = "default";

// Chuẩn hoá mã site: chữ thường, chỉ a-z 0-9 _ - , tối đa 40 ký tự.
export function normalizeSite(s: string | null | undefined): string {
  const v = (s || "").trim().toLowerCase();
  return /^[a-z0-9_-]{1,40}$/.test(v) ? v : DEFAULT_SITE;
}

// Mã site của deployment hiện tại (dùng cho các trang công khai).
export function currentSite(): string {
  return normalizeSite(process.env.SITE_KEY || DEFAULT_SITE);
}
