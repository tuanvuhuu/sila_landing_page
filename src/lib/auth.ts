import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";

/**
 * Dùng trong Server Components (admin/page.tsx)
 * — đọc cookie qua next/headers
 */
export function isAuthed(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return !!token && token === process.env.SESSION_SECRET;
}

/**
 * Dùng trong Route Handlers (API routes)
 * — đọc cookie trực tiếp từ Request headers (đáng tin hơn trong Route Handler context)
 */
export function isAuthedFromReq(req: Request): boolean {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  return !!token && token === process.env.SESSION_SECRET;
}
