# SILA Complete Setup & Configuration Guide

**Hướng dẫn toàn diện cấu hình Backend, Database, Vercel và tất cả dịch vụ khác.**

## 📚 Tất cả các File Cấu Hình

### 1. Frontend Configuration
```
├── config.js                    # Frontend config (company info, colors, APIs)
├── CONFIG_QUICK_START.md        # Quick guide for frontend config
└── CONFIGURATION.md             # Detailed frontend configuration
```

### 2. Backend & Infrastructure Configuration  
```
├── .env                         # Environment variables (⚠️ DO NOT COMMIT)
├── .env.example                 # Environment variables template
├── backend-config.js            # Backend configuration for Node.js
├── vercel.json                  # Vercel deployment settings
├── DATABASE_SCHEMA.md           # Database structure and setup
└── VERCEL_DEPLOYMENT.md         # Vercel deployment guide
```

### 3. Deployment & Infrastructure
```
├── DEPLOYMENT.md                # Basic deployment guide
├── INFRASTRUCTURE_GUIDE.md      # Complete infrastructure overview
└── COMPLETE_SETUP_GUIDE.md      # This file
```

## 🎯 5-Step Quick Setup

### Step 1: Clone & Install (5 min)
```bash
git clone <repo>
cd sila_landing_page
npm install
```

### Step 2: Configure Frontend (5 min)
```bash
# Edit config.js with your company info
nano config.js

# Changes:
# - company.name
# - contact.* (address, phone, email)
# - colors.* (if want custom colors)
# - social.* (facebook, instagram, etc)
```

### Step 3: Setup Database (10 min)
```bash
# Option A: MongoDB Cloud (Fastest)
1. Vào mongodb.com/cloud/atlas
2. Tạo free Cluster
3. Copy connection string
4. Paste vào config.js hoặc .env

# Option B: PostgreSQL (Recommended for production)
1. Local: brew install postgresql
2. Cloud: Railway.app hoặc Supabase
```

### Step 4: Configure Backend (10 min)
```bash
# Copy .env.example → .env
cp .env.example .env

# Edit .env file:
nano .env

# Thay đổi:
NODE_ENV=production
DATABASE_URI=your_database_url
JWT_SECRET=your_secret_key_32_chars_min
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Step 5: Deploy to Vercel (5 min)
```bash
1. Push to GitHub
2. Vào vercel.com
3. Import project
4. Add environment variables
5. Deploy!
```

## 📊 Configuration Files Reference

### config.js (Frontend)
**Mục đích**: Quản lý giao diện, dữ liệu công ty, màu sắc

```javascript
// Các cấu hình quan trọng:
company.name          // Tên công ty
contact.phone         // Số điện thoại
contact.email         // Email liên hệ
colors.primaryBlue    // Màu chính
social.facebook       // Link social media
programs[]            // Danh sách khóa học
stats.*               // Thống kê
```

**Khi nào sửa**: Khi muốn đổi thông tin công ty, màu sắc, khóa học

### .env (Backend)
**Mục đض**: Lưu trữ secrets, API keys, database URLs

```bash
DATABASE_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
EMAIL_USER=your@email.com
STRIPE_KEY=sk_live_xxx
GOOGLE_ANALYTICS_ID=G-xxx
```

**⚠️ Lưu ý**: 
- Không commit .env file
- Giữ bí mật tất cả các key
- Sử dụng các Vercel Environment Variables cho production

### backend-config.js (Backend)
**Mục đích**: Cấu hình cho Node.js server

```javascript
// Đọc từ .env và áp dụng
database.mongodb.uri = process.env.MONGODB_URI
auth.jwtSecret = process.env.JWT_SECRET
email.senderEmail = process.env.SENDER_EMAIL
```

**Khi nào sửa**: Hiếm khi, chủ yếu thay đổi trong .env

### vercel.json (Deployment)
**Mục đích**: Cấu hình Vercel deployment

```json
{
    "buildCommand": "npm run build",
    "env": {
        "NODE_ENV": "production"
    },
    "routes": [ /* API routes */ ],
    "headers": [ /* Security headers */ ]
}
```

**Khi nào sửa**: Khi thêm API routes hoặc thay đổi build command

## 🗄️ Database Setup

### MongoDB (Khuyên dùng cho MVP)

**Local Setup**:
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
mongod

# Connect
mongo mongodb://localhost:27017
```

**Cloud Setup** (MongoDB Atlas):
```bash
1. Vào mongodb.com/cloud/atlas
2. Create Account → Create Organization
3. Create Project → Create Cluster (M0 free)
4. Create User (username/password)
5. Network Access → Whitelist all IPs (0.0.0.0/0)
6. Copy Connection String
7. Replace password and database name

mongodb+srv://username:password@cluster.mongodb.net/sila_db
```

**Add to .env**:
```bash
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### PostgreSQL (Production-Ready)

**Local Setup**:
```bash
# Install PostgreSQL
brew install postgresql

# Start server
brew services start postgresql

# Create database
createdb sila_db

# Create user
psql -d sila_db
CREATE USER sila_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sila_db TO sila_user;
```

**Cloud Setup** (Railway):
```bash
1. Vào railway.app
2. Sign up with GitHub
3. Create new project → Add Database → PostgreSQL
4. Copy Database URL
5. Paste vào .env
```

**Add to .env**:
```bash
DATABASE_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_USER=sila_user
DB_PASSWORD=password
DB_NAME=sila_db
```

## 🔑 API Keys & Services Setup

### Google Analytics

```bash
1. Vào google.com/analytics
2. Create Property → Choose Website
3. Configure Data Stream
4. Get Measurement ID (G-XXXXXXXXXX)
5. Paste vào .env: GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Email Service (Gmail)

```bash
1. Enable 2-Factor Authentication trên Gmail
2. Create App Password
3. Paste vào .env:
   EMAIL_SERVICE=gmail
   EMAIL_USER=your@gmail.com
   EMAIL_PASSWORD=app_password_16_chars
```

### Stripe (Optional - Payment)

```bash
1. Vào stripe.com → Sign up
2. Get API Keys
3. Paste vào .env:
   STRIPE_PUBLIC_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
```

### AWS S3 (Optional - File Upload)

```bash
1. AWS Console → Create IAM User
2. Give S3 permissions
3. Get Access Key + Secret Key
4. Create S3 Bucket
5. Paste vào .env:
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   AWS_S3_BUCKET=sila-uploads
```

## 🚀 Vercel Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Connect to Vercel
```bash
1. Vào vercel.com
2. Sign up with GitHub
3. Import repository
4. Select branch: main (or your branch)
5. Click Import
```

### Step 3: Add Environment Variables
```bash
# Project Settings → Environment Variables
# Add tất cả từ .env file:

NODE_ENV=production
DATABASE_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
GOOGLE_ANALYTICS_ID=G-xxx
STRIPE_PUBLIC_KEY=pk_xxx
# ... thêm các biến khác
```

### Step 4: Configure Build Settings
```bash
Build Command: npm run build (hoặc empty)
Output Directory: . (root)
Install Command: npm install (mặc định)
```

### Step 5: Deploy
```bash
Click "Deploy" button
Wait 1-2 minutes
Your site is live! 🚀
```

### Step 6: Custom Domain (Optional)
```bash
1. Buy domain (Namecheap, GoDaddy, Google Domains)
2. Project Settings → Domains
3. Add custom domain
4. Update Nameservers or DNS
5. Wait 24-48 hours for propagation
```

## 🔐 Security Configuration

### Environment Variables Best Practices
```bash
# ❌ WRONG
API_KEY="sk_live_abc123" // In code

# ✅ CORRECT
# In .env file
API_KEY=sk_live_abc123

# In code
const apiKey = process.env.API_KEY;
```

### Vercel Secrets Management
```bash
# For production, use Vercel's environment variables
# Never push .env file to Git

# .gitignore
.env
.env.local
.env.*.local
```

### Database Security
```bash
# MongoDB Atlas:
1. Enable IP Whitelist (or use specific IPs)
2. Create password-protected user
3. Enable encryption at rest

# PostgreSQL:
1. Use strong password
2. Enable SSL/TLS
3. Regular backups
```

## 📊 Monitoring Setup

### Google Analytics
```bash
1. Dashboard → Real-time
2. Monitor Users, Page Views, Conversions
```

### Vercel Analytics
```bash
1. Project Settings → Analytics
2. Enable Web Vitals tracking
3. Monitor Core Web Vitals
```

### Database Monitoring
```bash
# MongoDB Atlas
1. Cluster → Metrics
2. Monitor queries, storage, CPU

# PostgreSQL
1. AWS RDS Dashboard
2. CloudWatch metrics
```

## 🔄 CI/CD Pipeline

**Automatic Deployment**:
```
Code pushed to main
       ↓
GitHub triggers Vercel
       ↓
Vercel builds project
       ↓
Tests run (if configured)
       ↓
Deploy to production
       ↓
Live! 🚀
```

**Preview Deployments**:
```
Create Pull Request
       ↓
Vercel creates preview URL
       ↓
Share preview link for review
       ↓
Merge to main when approved
```

## 📋 Configuration Checklist

### Before Deployment
- [ ] config.js updated with company info
- [ ] .env created with all variables
- [ ] Database setup and tested
- [ ] API keys obtained from services
- [ ] Email service configured
- [ ] Vercel account created
- [ ] GitHub repository synced

### During Deployment
- [ ] Environment variables added to Vercel
- [ ] Build settings configured
- [ ] Domain added (optional)
- [ ] SSL/TLS enabled
- [ ] Deployment successful

### After Deployment
- [ ] Test site on production URL
- [ ] Test contact form
- [ ] Check analytics tracking
- [ ] Monitor error logs
- [ ] Setup backups
- [ ] Monitor performance

## 🆘 Troubleshooting

### Environment Variables Not Working
```bash
# Solution:
1. Verify names are exactly correct (case-sensitive)
2. Re-deploy after adding variables
3. Check right environment (Production/Preview/Dev)
4. Clear browser cache
```

### Database Connection Error
```bash
# Solution:
1. Check connection string format
2. Verify username/password
3. Add Vercel IPs to whitelist
4. Check database is running
5. Test with MongoDB Compass
```

### Site Not Loading
```bash
# Solution:
1. Check DNS propagation (24-48 hours)
2. Verify custom domain settings
3. Check Vercel deployment logs
4. Clear browser cache (Ctrl+Shift+Del)
```

## 📚 Additional Resources

### Documentation
- Vercel: https://vercel.com/docs
- MongoDB: https://docs.mongodb.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Node.js: https://nodejs.org/docs/

### Tools
- MongoDB Compass: GUI for MongoDB
- pgAdmin: GUI for PostgreSQL
- Postman: API testing tool
- VS Code: Code editor

### Services
- MongoDB Atlas: https://mongodb.com/cloud/atlas
- Railway: https://railway.app
- Supabase: https://supabase.com
- Vercel: https://vercel.com

## 📞 Support

For questions about specific topics:
1. Frontend: See `CONFIG_QUICK_START.md`
2. Database: See `DATABASE_SCHEMA.md`
3. Deployment: See `VERCEL_DEPLOYMENT.md`
4. Infrastructure: See `INFRASTRUCTURE_GUIDE.md`

---

**🎉 Complete Setup Done! Your site is ready to go live!**
