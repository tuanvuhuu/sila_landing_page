# SILA English Center — Landing page + Trang quản trị (Next.js + TypeScript)

Landing page chuyên nghiệp cho SILA English Center (trung tâm tiếng Anh cho trẻ em và thanh thiếu niên), 
kèm trang quản trị tự xây để sửa nội dung, tải ảnh và xem danh sách phụ huynh đăng ký — không cần đụng tới code.

## Có sẵn những gì

- Trang công khai `/` đọc nội dung **động** từ cơ sở dữ liệu (không phải HTML cứng).
- Form đăng ký gửi thông tin phụ huynh về cơ sở dữ liệu.
- Trang quản trị `/admin` (có đăng nhập) để: sửa chữ, tải ảnh đầu trang & thư viện,
  thêm/sửa/xóa chương trình, sửa ưu đãi, sửa liên hệ, và **xem danh sách khách đăng ký**.
- API, xác thực, cơ sở dữ liệu (SQLite + Prisma) và lưu ảnh đã nối sẵn với nhau.

## Yêu cầu

- Node.js 18.18 trở lên.

## Cài đặt và chạy

```bash
# 1. Cài thư viện (lệnh này cũng tự chạy "prisma generate")
npm install

# 2. Tạo file cấu hình từ mẫu, rồi mở .env và đổi mật khẩu + chuỗi bí mật
cp .env.example .env

# 3. Tạo cơ sở dữ liệu (SQLite, file dev.db trong dự án)
npm run db:push

# 4. Chạy ở chế độ phát triển
npm run dev
```

Mở:
- Trang công khai: http://localhost:3000
- Trang quản trị: http://localhost:3000/admin (đăng nhập bằng `ADMIN_PASSWORD` trong file .env)

Sau khi đăng nhập, sửa nội dung và bấm "Lưu thay đổi", rồi tải lại trang chủ để thấy thay đổi.

## Cấu trúc chính

```
prisma/schema.prisma        Định nghĩa cơ sở dữ liệu (nội dung + lead)
src/lib/db.ts               Kết nối Prisma
src/lib/auth.ts             Kiểm tra đăng nhập (cookie)
src/lib/content.ts          Kiểu dữ liệu + nội dung mặc định + hàm đọc nội dung
src/app/page.tsx            Trang công khai (đọc nội dung từ DB)
src/app/LeadForm.tsx        Form đăng ký (gửi lead)
src/app/admin/page.tsx      Cổng kiểm tra đăng nhập
src/app/admin/AdminEditor.tsx  Trình chỉnh sửa nội dung + xem lead
src/app/admin/login/page.tsx   Trang đăng nhập
src/app/api/...             Các API: content, leads, upload, auth
public/uploads/             Nơi lưu ảnh tải lên
```

## Khi đưa lên chạy thật (production) — nên nâng cấp

Bộ này tối giản để bạn học và phát triển tiếp. Trước khi dùng thật, cân nhắc:

1. **Xác thực:** thay cơ chế cookie đơn giản bằng `NextAuth` và mật khẩu được mã hóa (hash).
2. **Cơ sở dữ liệu:** đổi SQLite sang PostgreSQL (ví dụ Supabase/Neon) — chỉ cần đổi `provider`
   trong `schema.prisma` và `DATABASE_URL`.
3. **Lưu ảnh:** đổi từ thư mục `public/uploads` sang dịch vụ đám mây (Cloudinary, S3),
   vì nhiều nền tảng hosting không giữ file tải lên giữa các lần deploy.
4. **Theo dõi:** gắn Google Analytics / Facebook Pixel vào `src/app/layout.tsx`.
5. Cập nhật `.env` trên môi trường hosting (đừng commit file `.env` lên Git).

## Gợi ý deploy

Đẩy code lên GitHub rồi kết nối với Vercel. Nhớ đặt biến môi trường trên Vercel và dùng
cơ sở dữ liệu đám mây thay cho SQLite.

## Chạy quảng cáo Facebook (đã tích hợp sẵn)

Dự án đã gắn sẵn công cụ để chạy và đo lường quảng cáo Facebook:

1. **Facebook Pixel** — đặt `NEXT_PUBLIC_FB_PIXEL_ID` trong `.env` (lấy ở Meta
   Events Manager). Trang sẽ tự bắn sự kiện `PageView`.
2. **Sự kiện Lead** — khi phụ huynh đăng ký thành công, trang tự bắn sự kiện
   `Lead` cho Pixel. Dùng sự kiện này để tối ưu quảng cáo theo "khách tiềm năng".
3. **Conversions API (tùy chọn, nên có)** — tracking phía máy chủ, không bị iOS
   hay trình chặn quảng cáo cản. Đặt thêm `FB_PIXEL_ID` và `FB_CAPI_TOKEN`.
4. **Bắt nguồn quảng cáo (UTM)** — khi đặt link quảng cáo, thêm tham số vào URL:
   `https://trang-cua-ban.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=he2026&utm_content=video_a`
   Mỗi khách đăng ký sẽ được lưu kèm nguồn này, xem được trong trang admin
   (cột "Nguồn"). Nhờ đó bạn biết quảng cáo/chiến dịch nào ra khách.

### Mẹo khi chạy ads
- Thông điệp trên quảng cáo phải khớp với tiêu đề trang (message match) để không
  mất khách ngay khi vừa bấm vào.
- Đa số phụ huynh xem trên điện thoại — trang đã tối ưu mobile sẵn.
- Sau khi deploy, dùng tiện ích "Meta Pixel Helper" (Chrome) để kiểm tra Pixel và
  sự kiện Lead có bắn đúng không.
- Lưu ý: sau khi cập nhật cơ sở dữ liệu (thêm cột nguồn), chạy lại `npm run db:push`.

### Các sự kiện đã tích hợp (cập nhật)
- `PageView`, `Lead` (đăng ký) — Lead bắn ở cả Pixel và Conversions API, dùng chung
  `event_id` nên Facebook tự khử trùng (không bị đếm 2 lần).
- `StartForm` (bắt đầu điền form) và `ViewContent` (cuộn tới phần chương trình) —
  sự kiện "phễu trên" để tối ưu khi lượng Lead còn ít.
- `Contact` — khi bấm nút gọi / Zalo / Messenger (có cụm nút liên hệ nổi). Cấu hình
  link Zalo/Messenger trong trang admin > Liên hệ.
- `Purchase` — tự gửi về Facebook khi bạn đổi trạng thái một khách sang "Đã ghi danh"
  trong admin (kèm giá trị `FB_PURCHASE_VALUE`). Giúp FB tối ưu tìm khách thật sự ghi danh.

Trang admin > "Khách đăng ký" giờ có cột **Trạng thái** (Mới / Đã gọi / Đã học thử /
Đã ghi danh / Không quan tâm) — đây cũng chính là khâu chăm sóc trong vòng lặp vận hành.

## Gắn domain riêng & SEO

Sau khi deploy lên Vercel và mua domain, làm 3 bước:

1. **Trỏ domain về Vercel:** Vercel > project > Settings > Domains > Add, nhập domain
   (nên thêm cả `www`). Vercel hiện các bản ghi DNS cần tạo.
2. **Cấu hình DNS** tại nhà cung cấp domain: domain gốc tạo bản ghi **A** trỏ IP Vercel
   (`76.76.21.21`), `www` tạo **CNAME** trỏ `cname.vercel-dns.com`. Vercel tự cấp SSL (https).
3. **Đặt biến môi trường** `NEXT_PUBLIC_SITE_URL` trên Vercel = domain thật
   (vd `https://eslacademy.vn`), rồi **Redeploy**. Biến này dùng cho:
   - Thẻ Open Graph (link đẹp khi share Facebook/Zalo) trong `src/app/layout.tsx`.
   - `sitemap.xml` (`src/app/sitemap.ts`) và `robots.txt` (`src/app/robots.ts`).

Kiểm tra: mở `https://<domain>/sitemap.xml`, `https://<domain>/robots.txt`, và dán link
trang chủ vào **Facebook Sharing Debugger** để xem ảnh + tiêu đề hiển thị đúng chưa.

## Cơ sở dữ liệu cho production (quan trọng)

SQLite chỉ dùng để chạy thử trên máy. Khi deploy lên Vercel (hoặc hosting serverless),
file `dev.db` KHÔNG được lưu lại — phải dùng **PostgreSQL**. Khuyến nghị **Neon** (miễn phí):

1. Tạo tài khoản ở https://neon.tech, tạo một project → lấy chuỗi `DATABASE_URL`.
2. Trong `prisma/schema.prisma`, đổi:
   `provider = "sqlite"`  →  `provider = "postgresql"`
3. Đặt `DATABASE_URL` (chuỗi Neon) vào `.env` (và vào biến môi trường trên Vercel).
4. Chạy `npm run db:push` để tạo bảng trên Postgres.

Lựa chọn khác: **Supabase** (Postgres + có giao diện xem dữ liệu) hoặc **Vercel Postgres**.
Có thể dùng chính chuỗi Neon cho cả máy local để khỏi cài Postgres riêng.

## Email báo khách mới

Mỗi khi có khách đăng ký, hệ thống tự gửi email về `LEAD_NOTIFY_EMAIL`
(mặc định: tuanvuhuu2798@gmail.com). Cách bật:

1. Tạo API key miễn phí tại https://resend.com, dán vào `RESEND_API_KEY` trong `.env`.
2. Để test nhanh, giữ `LEAD_FROM_EMAIL="ESL Academy <onboarding@resend.dev>"` —
   Resend cho phép gửi tới chính email tài khoản của bạn.
3. Khi chạy thật: xác minh tên miền riêng trên Resend rồi đổi `LEAD_FROM_EMAIL`
   sang địa chỉ thuộc tên miền đó (vd `no-reply@eslacademy.edu.vn`).

(Nếu thích dùng SMTP/Gmail thay cho Resend, có thể thay nội dung `src/lib/email.ts`
bằng thư viện nodemailer + tài khoản SMTP.)

## Trang cảm ơn

Sau khi đăng ký thành công, khách được chuyển sang trang `/cam-on`. Trang này bắn thêm
sự kiện `CompleteRegistration`, nên bạn có thể tạo một "Custom Conversion" trên Facebook
dựa theo URL chứa `/cam-on` để đo chuyển đổi cực kỳ chính xác.
