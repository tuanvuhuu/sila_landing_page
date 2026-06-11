# ESL Academy Landing Page — Logic Documentation

## 1. Tổng quan kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5.5.4 |
| Database | PostgreSQL (Prisma ORM 5.17) |
| Font | Quicksand + Nunito (Google Fonts) |
| Email | Resend REST API |
| Tracking | Facebook Pixel + Conversions API (CAPI) |

### Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx              # Root layout (font, FB Pixel)
│   ├── page.tsx                # Trang chủ landing page (Server Component)
│   ├── globals.css             # CSS toàn bộ giao diện
│   ├── Contact.tsx             # Client: Call Center FAB popup + tracking Contact
│   ├── EngagementTracker.tsx   # Client: tracking ViewContent khi cuộn
│   ├── FaqSection.tsx          # Client: accordion FAQ
│   ├── LeadForm.tsx            # Client: form đăng ký học thử
│   ├── su-kien/
│   │   ├── page.tsx            # Trang danh sách sự kiện (Server Component)
│   │   └── EventTabs.tsx       # Client: tabs Sắp tới / Đã diễn ra
│   ├── cam-on/
│   │   ├── page.tsx            # Trang cảm ơn sau đăng ký
│   │   └── ThankYouTracker.tsx # Tracking CompleteRegistration
│   ├── admin/
│   │   ├── page.tsx            # Trang admin (kiểm tra auth → redirect)
│   │   ├── AdminEditor.tsx     # Client: editor nội dung + quản lý lead
│   │   ├── admin.css           # CSS riêng admin
│   │   └── login/page.tsx      # Client: form đăng nhập admin
│   └── api/
│       ├── auth/login/route.ts   # POST: đăng nhập
│       ├── auth/logout/route.ts  # POST: đăng xuất
│       ├── content/route.ts      # GET: lấy nội dung | PUT: lưu nội dung
│       ├── events/route.ts       # GET/POST/PUT/DELETE: CRUD sự kiện
│       ├── leads/route.ts        # POST: tạo lead | GET: xem lead | PATCH: đổi trạng thái
│       └── upload/route.ts       # POST: upload ảnh
├── components/
│   └── FacebookPixel.tsx       # Nhúng FB Pixel script
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── content.ts              # Type definitions + getContent() từ DB
│   ├── auth.ts                 # Kiểm tra session cookie
│   ├── email.ts                # Gửi email thông báo lead mới (Resend)
│   └── fbcapi.ts               # Facebook Conversions API (server-side)
└── global.d.ts                 # Khai báo window.fbq
```

---

## 2. Database (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model SiteContent {
  id   Int    @id @default(1)    // Luôn chỉ có 1 bản ghi (id=1)
  data String                    // JSON chứa toàn bộ nội dung trang
}

model Lead {
  id          Int      @id @default(autoincrement())
  name        String
  phone       String
  ageGroup    String   @default("")
  status      String   @default("new")    // new | contacted | trial | enrolled | lost
  utmSource   String   @default("")
  utmMedium   String   @default("")
  utmCampaign String   @default("")
  utmContent  String   @default("")
  utmTerm     String   @default("")
  fbclid      String   @default("")
  createdAt   DateTime @default(now())
}

model Event {
  id          Int       @id @default(autoincrement())
  title       String
  description String    @default("")
  image       String    @default("")
  date        DateTime                   // Ngày diễn ra
  endDate     DateTime?                  // Ngày kết thúc (tùy chọn)
  location    String    @default("")
  ctaText     String    @default("Đăng ký tham gia")
  ctaLink     String    @default("#signup")
  status      String    @default("draft") // draft | published | cancelled
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Ghi chú:**
- `SiteContent` chỉ có **1 row duy nhất** (id=1), field `data` là JSON string chứa toàn bộ nội dung trang.
- `Lead` lưu mỗi phụ huynh đăng ký, kèm UTM params để biết nguồn quảng cáo.
- Trạng thái chăm sóc: `new` → `contacted` → `trial` → `enrolled` hoặc `lost`.
- `Event` quản lý sự kiện. Sự kiện có `date >= hôm nay` = sắp tới, `date < hôm nay` = đã diễn ra (tự động).

---

## 3. Environment Variables

| Biến | Mô tả | Bắt buộc |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | ✅ |
| `ADMIN_PASSWORD` | Mật khẩu đăng nhập admin | ✅ |
| `SESSION_SECRET` | Chuỗi bí mật cho cookie session | ✅ |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook Pixel ID (client-side) | ❌ |
| `FB_PIXEL_ID` | Pixel ID cho CAPI (server-side) | ❌ |
| `FB_CAPI_TOKEN` | Facebook Conversions API Token | ❌ |
| `FB_PURCHASE_VALUE` | Giá trị 1 khách ghi danh (VND) | ❌ |
| `FB_CURRENCY` | Đơn vị tiền tệ (mặc định "VND") | ❌ |
| `RESEND_API_KEY` | API key Resend để gửi email | ❌ |
| `LEAD_NOTIFY_EMAIL` | Email nhận thông báo lead mới | ❌ |
| `LEAD_FROM_EMAIL` | Email người gửi | ❌ |

---

## 4. Logic chi tiết từng module

### 4.1 Content System (`src/lib/content.ts`)

**Type `SiteContent`** — cấu trúc dữ liệu nội dung trang:

```
{
  centerName: string,
  hero: { title, subtitle, ctaText, image, eyebrow },
  stats: [{ num, lbl }],
  programs: [{ age, title, desc }],
  features: [{ title, desc }],
  testimonials: [{ name, role, text, rating, avatar }],
  gallery: string[],            // mảng URL ảnh
  faq: [{ q, a }],
  promo: { title, desc },
  contact: { phone, address, email, zalo, messenger, facebook, fbPageId, zaloOAId }
}
```

**`getContent()`** — hàm lấy nội dung (được cache bằng `React.cache`):
1. Query `SiteContent` (id=1) từ DB.
2. Nếu không có → trả `defaultContent` (giá trị mặc định hardcode).
3. Nếu có → parse JSON, merge với `defaultContent` (spread) để đảm bảo luôn có đủ field.
4. Nếu parse lỗi → fallback `defaultContent`.

### 4.2 Authentication (`src/lib/auth.ts`)

- **Cơ chế**: Cookie-based, single-user (1 admin duy nhất).
- Cookie tên `admin_session`, giá trị = `SESSION_SECRET`.
- `isAuthed()`: kiểm tra cookie value === `SESSION_SECRET`.

### 4.3 API Routes

#### `POST /api/auth/login`
1. Nhận `{ password }` từ body.
2. So sánh với `ADMIN_PASSWORD` trong env.
3. Nếu đúng → set cookie `admin_session` = `SESSION_SECRET`, httpOnly, maxAge 7 ngày.

#### `POST /api/auth/logout`
1. Xóa cookie `admin_session` (set maxAge=0).

#### `GET /api/content`
1. Gọi `getContent()` → trả JSON nội dung trang.

#### `PUT /api/content` (cần auth)
1. Kiểm tra `isAuthed()`.
2. Nhận body JSON → upsert vào `SiteContent` (id=1).

#### `POST /api/leads` (public)
1. Nhận `{ name, phone, ageGroup, utm, eventId }`.
2. Validate: bắt buộc `name` + `phone`.
3. Tạo record `Lead` trong DB (kèm UTM params).
4. Gửi sự kiện `Lead` về Facebook CAPI (server-side, dùng `eventId` để khử trùng với Pixel).
5. Gửi email thông báo cho trung tâm qua Resend (nếu đã cấu hình).

#### `GET /api/leads` (cần auth)
1. Trả danh sách leads, sắp xếp mới nhất trước.

#### `PATCH /api/leads` (cần auth)
1. Nhận `{ id, status }`.
2. Update trạng thái lead.
3. Nếu status = `"enrolled"` → gửi sự kiện `Purchase` về Facebook CAPI.

#### `POST /api/upload` (cần auth)
1. Nhận FormData chứa `file`.
2. Lưu vào `public/uploads/` với tên file = `{timestamp}-{random}.{ext}`.
3. Trả URL `/uploads/{filename}`.

#### `GET /api/events` (public)
1. Mặc định: trả sự kiện `published` có `date >= hôm nay`, sắp xếp gần nhất trước.
2. `?history=1`: trả sự kiện đã qua (`date < hôm nay`), mới nhất trước.
3. `?limit=3`: giới hạn số lượng.
4. `?all=1` (cần auth): trả tất cả sự kiện bao gồm draft/cancelled, cho admin.

#### `POST /api/events` (cần auth)
1. Nhận `{ title, description, image, date, endDate, location, ctaText, ctaLink, status }`.
2. Validate: bắt buộc `title` + `date`.
3. Tạo record `Event` trong DB.

#### `PUT /api/events` (cần auth)
1. Nhận `{ id, ...fields }` → update sự kiện.

#### `DELETE /api/events` (cần auth)
1. Nhận `{ id }` → xóa sự kiện.

### 4.4 Facebook Tracking

#### Client-side (Pixel) — `FacebookPixel.tsx`
- Chỉ render nếu `NEXT_PUBLIC_FB_PIXEL_ID` tồn tại.
- Load script `fbevents.js`, init pixel, track `PageView`.

#### Client-side events:
| Sự kiện | Khi nào | File |
|---|---|---|
| `PageView` | Mỗi trang load | FacebookPixel.tsx |
| `ViewContent` | Cuộn tới section "Chương trình học" (40% visible) | EngagementTracker.tsx |
| `Contact` | Click kênh liên hệ trong Call Center popup (phone/zalo/messenger/facebook) | Contact.tsx |
| `StartForm` (custom) | Focus lần đầu vào form | LeadForm.tsx |
| `Lead` | Submit form thành công | LeadForm.tsx |
| `CompleteRegistration` | Vào trang /cam-on | ThankYouTracker.tsx |

#### Server-side (CAPI) — `fbcapi.ts`
- Chỉ gửi nếu `FB_PIXEL_ID` + `FB_CAPI_TOKEN` tồn tại.
- **`sendLeadToCapi()`**: gửi event `Lead` kèm `eventId` (khử trùng với Pixel), hash SĐT bằng SHA-256.
- **`sendEnrolledToCapi()`**: gửi event `Purchase` khi admin đổi status → `enrolled`, kèm `value` + `currency`.
- User data: `ph` (phone hash), `fbc` (fbclid), `fbp` (cookie), `client_ip_address`, `client_user_agent`.

### 4.5 Email Notification (`src/lib/email.ts`)

- Dùng **Resend REST API** (không cần thư viện).
- Chỉ gửi nếu `RESEND_API_KEY` tồn tại.
- Nội dung HTML: tên, SĐT, độ tuổi, nguồn, thời gian + nút "Gọi lại ngay".
- Lỗi email **không ảnh hưởng** tới việc lưu lead (try-catch bọc ngoài).

---

## 5. Logic các trang

### 5.1 Trang chủ `/` (`page.tsx` — Server Component)

- `export const dynamic = "force-dynamic"` → luôn render server-side (không cache).
- `generateMetadata()`: tạo SEO metadata từ content DB.
- Render các section: Header → Hero → Stats → Programs → Why → Testimonials → **Sự kiện sắp tới** → Gallery → FAQ → Offer → Signup Form → Footer → Mobile CTA + Contact FABs.
- **Section "Sự kiện sắp tới"**: query tối đa 3 event `published` có `date >= now`, ẩn nếu không có. Link "Xem tất cả" → `/su-kien`.
- Icon SVG tự vẽ theo phong cách logo (xanh lá `#80B848` + cam `#F58220`).

### 5.2 Trang cảm ơn `/cam-on` (Server Component)

- Hiển thị sau khi phụ huynh đăng ký thành công.
- Track `PageView` + `CompleteRegistration` (client-side).
- Hiển thị nút Gọi, Zalo, Về trang chủ.

### 5.3 Trang sự kiện `/su-kien` (Server Component)

- `export const dynamic = "force-dynamic"`.
- Query 2 danh sách: upcoming (date >= now) và past (date < now).
- Truyền data xuống `EventTabs` (Client Component) để render 2 tab: **Sắp tới** / **Đã diễn ra**.
- Event card hiển thị: ảnh, ngày, tiêu đề, mô tả, địa điểm, nút CTA.
- Sự kiện đã qua: hiện badge "Đã kết thúc", ẩn nút CTA.

### 5.4 Admin `/admin`

- **Guard**: nếu chưa đăng nhập → redirect `/admin/login`.
- **Login** (`/admin/login`): form nhập mật khẩu → POST `/api/auth/login`.
- **Editor** (`AdminEditor.tsx`): form chỉnh sửa toàn bộ nội dung trang.

#### Admin Editor logic:
- State `c` = clone của `SiteContent`, dùng `structuredClone` khi patch.
- `patch(updater)`: nhận hàm mutate draft → tạo bản clone mới, set `saved=false`.
- `save()`: PUT `/api/content` với toàn bộ state.
- **Quản lý Lead**: GET `/api/leads` khi mount, hiển thị bảng với dropdown đổi trạng thái.
- **Quản lý Sự kiện**: GET `/api/events?all=1` khi mount, CRUD qua modal form.
  - Form gồm: tiêu đề, mô tả, ngày, ngày kết thúc, địa điểm, ảnh bìa (upload), CTA, trạng thái (draft/published/cancelled).
  - Danh sách hiển thị: thumbnail, tiêu đề, ngày, trạng thái (màu), nút Sửa/Xóa.
- **Export CSV**: tạo CSV client-side (BOM UTF-8), download tự động.
- **Upload ảnh**: hero image, testimonial avatar, gallery, event image — gọi POST `/api/upload`.
- **Gallery**: hỗ trợ chọn nhiều ảnh cùng lúc, hiển thị progress.

### 5.5 LeadForm (Client Component)

1. `useEffect` khi mount: đọc UTM params từ URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`).
2. `onStart()`: track custom event `StartForm` lần đầu user focus vào form.
3. `submit()`:
   - Validate name + phone.
   - Tạo `eventId` = `crypto.randomUUID()` (fallback tự generate).
   - POST `/api/leads` với `{ name, phone, ageGroup, utm, eventId }`.
   - Track `Lead` event trên Pixel (với cùng `eventId` để khử trùng).
   - Redirect → `/cam-on`.

### 5.6 FaqSection (Client Component)

- Accordion: state `open` (index đang mở, hoặc null).
- Click → toggle mở/đóng.

### 5.7 Contact — Call Center FAB (Client Component)

- **`ContactLink`**: link thường (SĐT ở header/footer), click → track `Contact` event.
- **`ContactButtons`**: nút Call Center nổi góc dưới phải (1 nút tròn cam, pulse animation).
  - **Hover hoặc click** → mở popup "Liên hệ với chúng tôi" với danh sách kênh liên hệ.
  - Kênh **luôn hiển thị**: Gọi điện, Zalo (mặc định `zalo.me/{SĐT}`), Facebook. Messenger hiện khi có cấu hình.
  - Icon chuyển đổi phone ↔ ✕ với animation khi mở/đóng.
  - Di chuột ra ngoài → tự đóng sau 300ms delay (tránh đóng nhầm khi di chuột giữa nút và popup).
  - Click ra ngoài → tự đóng (useEffect + mousedown listener).
  - Mỗi kênh khi click → track `Contact` event với method tương ứng.

---

## 6. Luồng hoạt động chính

### Luồng phụ huynh đăng ký

```
1. Vào trang → Pixel track PageView
2. Cuộn xuống section "Chương trình" → Pixel track ViewContent
3. Click SĐT/Zalo → Pixel track Contact
4. Focus vào form → Pixel track StartForm (1 lần)
5. Điền form → Submit
   ├── Client: POST /api/leads { name, phone, ageGroup, utm, eventId }
   │   ├── Server: Lưu Lead vào DB
   │   ├── Server: Gửi Lead event → Facebook CAPI (eventId khử trùng)
   │   └── Server: Gửi email thông báo → Resend
   ├── Client: Pixel track Lead (eventId khử trùng)
   └── Client: Redirect → /cam-on
6. Trang /cam-on → Pixel track CompleteRegistration
```

### Luồng admin quản lý

```
1. Vào /admin → kiểm tra cookie
   ├── Chưa login → redirect /admin/login
   └── Đã login → render AdminEditor
2. Sửa nội dung → click "Lưu thay đổi"
   └── PUT /api/content → upsert SiteContent (id=1)
3. Xem danh sách lead → GET /api/leads
4. Đổi trạng thái lead → PATCH /api/leads { id, status }
   └── Nếu status = "enrolled" → CAPI gửi Purchase event
5. Upload ảnh → POST /api/upload → lưu public/uploads/
6. Xuất CSV → tạo client-side, download tự động
7. Đăng xuất → POST /api/auth/logout → xóa cookie
```

---

## 7. Thiết kế đặc biệt

- **Khử trùng sự kiện Facebook**: `eventId` được tạo client-side, gửi kèm server-side để FB loại bỏ sự kiện trùng.
- **Graceful degradation**: FB Pixel, CAPI, Email đều là tùy chọn — không cấu hình thì tự bỏ qua, không lỗi.
- **Single-row CMS**: toàn bộ nội dung trang lưu 1 JSON string trong 1 row DB → đơn giản, dễ backup.
- **Prisma singleton**: dùng `globalThis` trick để tránh tạo nhiều PrismaClient trong dev (hot reload).
- **`force-dynamic`**: trang chủ + cam-on luôn SSR, không bị cache static → nội dung luôn mới nhất.
