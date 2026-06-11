# SILA Landing Page - Environment Variables Setup Guide

Hướng dẫn chi tiết cấu hình tất cả environment variables.

## 🚀 Quick Start (3 phút)

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local

# For production
cp .env.example .env
```

---

## 📋 Database Configuration

### Local Development
```bash
# SQLite (simplest, no setup needed)
DATABASE_URL="file:./dev.db"

# Then run:
npx prisma db push
```

### Production - PostgreSQL

#### Option 1: Neon (Free tier available)
```bash
1. Vào https://neon.tech
2. Sign up → Create project
3. Copy connection string:
   postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
4. Paste vào .env:
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
```

#### Option 2: Railway
```bash
1. Vào https://railway.app
2. Create PostgreSQL database
3. Copy Database URL:
   postgresql://user:password@host:5432/db
4. Paste vào .env:
   DATABASE_URL="postgresql://user:password@host:5432/db"
```

#### Option 3: Vercel Postgres
```bash
1. Vercel Dashboard → Storage → Create Database (Postgres)
2. Copy POSTGRES_URL
3. Paste vào .env:
   DATABASE_URL="postgres://..."
```

---

## 🔐 Admin Authentication

### ADMIN_PASSWORD
```bash
# Mật khẩu đăng nhập trang admin
# Đổi từ mặc định "doimatkhaunay" thành mật khẩu của bạn
ADMIN_PASSWORD="your_secure_password_here"

# Sử dụng để login tại: /admin/login
```

### SESSION_SECRET
```bash
# Chuỗi bí mật dùng cho session cookie
# Phải dài tối thiểu 32 ký tự
# Tạo random string:

# macOS/Linux:
openssl rand -base64 32

# Windows (PowerShell):
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Hoặc dùng online tool: https://generate-random.org/
SESSION_SECRET="thay-bang-chuoi-ngau-nhien-32-ki-tu-tro-len"
```

---

## 🌐 Website Configuration

### NEXT_PUBLIC_SITE_URL
```bash
# Local development
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Staging
NEXT_PUBLIC_SITE_URL="https://staging.sila.edu.vn"

# Production
NEXT_PUBLIC_SITE_URL="https://sila.edu.vn"

# Dùng cho:
# - Open Graph (share trên Facebook, etc)
# - Sitemap
# - robots.txt
# - Canonical tags
```

### SITE_KEY (Multi-site)
```bash
# Để trống = "default" (dữ liệu cũ)
SITE_KEY=""

# Hay chỉ định:
SITE_KEY="sila-main"

# Nếu có nhiều site dùng chung 1 database:
# Site 1: SITE_KEY="sila-site1"
# Site 2: SITE_KEY="sila-site2"
# Admin xem tất cả
```

---

## 📊 Facebook Ads & Tracking

### NEXT_PUBLIC_FB_PIXEL_ID
```bash
# Facebook Pixel ID
# Lấy từ Meta Business Suite > Events Manager > Settings

1. Vào https://business.facebook.com
2. Events Manager → Settings
3. Copy Pixel ID
4. Paste vào:
   NEXT_PUBLIC_FB_PIXEL_ID="123456789"
```

### FB_PIXEL_ID & FB_CAPI_TOKEN
```bash
# Server-side Conversions API tracking (nên bật)
# Đáng tin hơn client-side tracking

1. Vào Events Manager → Settings
2. Copy Pixel ID:
   FB_PIXEL_ID="123456789"

3. Generate access token:
   - Settings → Access Tokens
   - Tạo token mới hoặc copy existing
   FB_CAPI_TOKEN="EAAxxxxxx"

# Test:
curl -X POST "https://graph.facebook.com/v18.0/123456789/events?access_token=EAAxxxxxx" \
  -d '{"data":[{"event_name":"Purchase","event_time":1234567890}]}'
```

### FB_PURCHASE_VALUE & FB_CURRENCY
```bash
# Giá trị trung bình 1 khách ghi danh (học phí)
FB_PURCHASE_VALUE="2000000"    # VND
FB_CURRENCY="VND"
```

---

## 📈 Google Analytics

### GOOGLE_ANALYTICS_ID
```bash
# Google Analytics 4 Measurement ID
# Format: G-XXXXXXXXXX

1. Vào https://analytics.google.com
2. Admin → Data Streams (choose your property)
3. Copy Measurement ID
4. Paste vào:
   GOOGLE_ANALYTICS_ID="G-ABC123XYZ"

# Test:
# Check Real-time section in Google Analytics
```

---

## 📧 Email Service (Resend)

### RESEND_API_KEY
```bash
# Email notifications khi có khách đăng ký
# Tạo free account: https://resend.com

1. Sign up tại https://resend.com
2. API Tokens → Create Token
3. Copy API key:
   RESEND_API_KEY="re_XXXXX"

# Limit: 100 emails/day free
```

### LEAD_NOTIFY_EMAIL
```bash
# Email nhận thông báo lead mới
LEAD_NOTIFY_EMAIL="tuanvuhuu2798@gmail.com"

# Sẽ nhận email mỗi khi có khách đăng ký form
```

### LEAD_FROM_EMAIL
```bash
# Email gửi thông báo
# Khi chưa verify domain riêng, dùng onboarding@resend.dev

LEAD_FROM_EMAIL="SILA Academy <onboarding@resend.dev>"

# Sau khi verify domain riêng:
LEAD_FROM_EMAIL="SILA Academy <noreply@sila.edu.vn>"
```

---

## 📁 File Upload (Vercel Blob)

### BLOB_READ_WRITE_TOKEN
```bash
# Upload ảnh/files (optional)
# Lấy từ Vercel project

1. Vercel Dashboard → Project Settings → Storage
2. Create Blob Storage (hoặc đã có)
3. Copy READ_WRITE_TOKEN:
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"
```

---

## 💳 Stripe Payment (Optional)

### STRIPE_PUBLIC_KEY & STRIPE_SECRET_KEY
```bash
# Thanh toán trực tuyến (optional)
# Tạo account: https://stripe.com

1. Sign up → Developers → API keys
2. Copy keys:
   STRIPE_PUBLIC_KEY="pk_live_XXXXX"
   STRIPE_SECRET_KEY="sk_live_XXXXX"
   STRIPE_WEBHOOK_SECRET="whsec_XXXXX"
```

---

## 🔗 Social Media

```bash
# Links đến các trang social
FACEBOOK_URL="https://facebook.com/sila"
INSTAGRAM_URL="https://instagram.com/sila"
TWITTER_URL="https://twitter.com/sila"
YOUTUBE_URL="https://youtube.com/sila"

# Để trống nếu chưa có tài khoản
# FACEBOOK_URL=""
```

---

## 🎛️ Features Toggle

```bash
# Bật/tắt các tính năng
ENABLE_ANIMATIONS=true          # Hiệu ứng scroll
ENABLE_FORM_SUBMISSION=true     # Form đăng ký
ENABLE_ANALYTICS=false          # Tracking (bật khi release)
MAINTENANCE_MODE=false          # Chế độ bảo trì
ENABLE_PAYMENT=false            # Thanh toán
```

---

## 🔄 Environment-Specific Setup

### Development (.env.local)
```bash
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="doimatkhaunay"
SESSION_SECRET="local-secret-only"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"
ENABLE_ANALYTICS=false
```

### Staging (.env.staging)
```bash
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="strong-password"
SESSION_SECRET="generate-random"
NEXT_PUBLIC_SITE_URL="https://staging.sila.edu.vn"
NODE_ENV="production"
ENABLE_ANALYTICS=true
```

### Production (.env)
```bash
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="very-strong-password"
SESSION_SECRET="very-long-random-string"
NEXT_PUBLIC_SITE_URL="https://sila.edu.vn"
NEXT_PUBLIC_FB_PIXEL_ID="123456789"
FB_PIXEL_ID="123456789"
FB_CAPI_TOKEN="EAAxxxxx"
GOOGLE_ANALYTICS_ID="G-XXXXX"
RESEND_API_KEY="re_XXXXX"
NODE_ENV="production"
ENABLE_ANALYTICS=true
```

---

## ⚠️ Security Best Practices

### ❌ NEVER
```bash
# Không commit .env file
# git add .env      ← ❌ WRONG
```

### ✅ DO
```bash
# Chỉ commit .env.example
# git add .env.example  ← ✅ RIGHT

# .gitignore
.env
.env.local
.env.*.local
```

### 🔐 Rotate Secrets
```bash
# Sau khi expose secrets:
# 1. Generate new SESSION_SECRET
# 2. Change ADMIN_PASSWORD
# 3. Regenerate Stripe/Resend tokens
# 4. Update tất cả nơi sử dụng
```

---

## ✅ Setup Checklist

### Local Development
- [ ] Copy .env.example → .env.local
- [ ] Set DATABASE_URL (file:./dev.db)
- [ ] Set ADMIN_PASSWORD
- [ ] Set SESSION_SECRET
- [ ] Run `npx prisma db push`
- [ ] Run `npm run dev`

### Staging/Preview
- [ ] Create PostgreSQL database
- [ ] Set DATABASE_URL
- [ ] Get Facebook Pixel ID
- [ ] Get Google Analytics ID
- [ ] Create Resend account
- [ ] Set all required variables
- [ ] Test form submission
- [ ] Test analytics tracking

### Production
- [ ] All variables from staging
- [ ] Set NEXT_PUBLIC_SITE_URL to production domain
- [ ] Strong ADMIN_PASSWORD
- [ ] Enable ENABLE_ANALYTICS
- [ ] Verify email sending
- [ ] Test payment (if enabled)
- [ ] Monitor error logs
- [ ] Set up backups

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL is missing"
```bash
# Solution: Set DATABASE_URL in .env
DATABASE_URL="file:./dev.db"  # or PostgreSQL URL
npx prisma db push
```

### "Admin login not working"
```bash
# Solution: Check ADMIN_PASSWORD
# Default is "doimatkhaunay"
# Change in .env and redeploy
```

### "Emails not sending"
```bash
# Solution: 
# 1. Set RESEND_API_KEY
# 2. Verify LEAD_NOTIFY_EMAIL
# 3. Check Resend dashboard for errors
```

### "Facebook Pixel not tracking"
```bash
# Solution:
# 1. Verify NEXT_PUBLIC_FB_PIXEL_ID
# 2. Check Facebook Events Manager > Test Events
# 3. Ensure site is HTTPS in production
```

---

## 📞 Getting Help

### Generate Secrets
- Session Secret: `openssl rand -base64 32`
- Password: https://generate-random.org/

### Service Logins
- Facebook: https://business.facebook.com
- Google Analytics: https://analytics.google.com
- Resend: https://resend.com
- Stripe: https://stripe.com
- Neon: https://neon.tech
- Railway: https://railway.app

### Documentation
- Next.js Env: https://nextjs.org/docs/basic-features/environment-variables
- Prisma: https://www.prisma.io/docs/
- Resend: https://resend.com/docs

---

**🎉 All environment variables configured! Ready to deploy!**
