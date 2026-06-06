import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";

// Kiểm tra người dùng đã đăng nhập admin chưa.
// Cách này đơn giản, đủ dùng cho một trang quản trị một người.
// Khi cần nhiều tài khoản, hãy thay bằng NextAuth.
export function isAuthed(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return !!token && token === process.env.SESSION_SECRET;
}
