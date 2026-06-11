# SILA Landing Page - Vercel Deployment Guide

Hướng dẫn chi tiết để deploy SILA landing page lên Vercel.

## 🚀 Tại Sao Chọn Vercel?

✅ **Ưu điểm:**
- Deployment tự động từ Git
- Free tier quá tốt
- Serverless functions support
- Global CDN
- Zero downtime deployments
- Built-in CI/CD
- HTTPS tự động
- Custom domains

## 📋 Prerequisites

1. **GitHub Account**: https://github.com
2. **Vercel Account**: https://vercel.com (miễn phí)
3. **Repository**: Pushed code lên GitHub

## 🔧 Setup Vercel Deployment

### Step 1: Push Code lên GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin claude/esl-landing-page-clone-3clo3i
```

### Step 2: Đăng ký Vercel

1. Vào https://vercel.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub"
4. Authorize Vercel access to GitHub

### Step 3: Import Project

1. Dashboard Vercel → "New Project"
2. Chọn repository: `sila_landing_page`
3. Chọn branch: `claude/esl-landing-page-clone-3clo3i`
4. Click "Import"

### Step 4: Configure Project

**Framework**: Chọn "Other" (static site)

**Build Settings**:
- Build Command: (Leave empty - no build needed)
- Output Directory: `.` (root folder)
- Install Command: (Leave empty)

**Environment Variables**: Thêm từ `.env` file

```
NODE_ENV=production
VERCEL_URL=https://sila.vercel.app
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
API_CONTACT_URL=https://your-backend.com/api/contact
```

### Step 5: Deploy

1. Click "Deploy"
2. Chờ deployment hoàn thành (~1-2 phút)
3. Lấy URL: `https://sila.vercel.app`

## 🌐 Custom Domain Setup

### Domain từ Vercel

1. Project Settings → Domains
2. Click "Add"
3. Nhập domain (e.g., `sila.edu.vn`)
4. Follow instructions

### Domain từ External Registrar

1. Project Settings → Domains → Add
2. Nhập domain
3. Copy Nameservers từ Vercel
4. Vào registrar account (GoDaddy, Namecheap, etc.)
5. Update Nameservers
6. Chờ 24-48 giờ propagation

**Recommended Registrars**:
- Namecheap
- Google Domains
- Vercel Domains

## 🔑 Environment Variables Setup

### Thêm Environment Variables

**Development**:
```
NODE_ENV=development
PORT=3000
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost/sila_dev
```

**Production** (Vercel):
```
NODE_ENV=production
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sila_prod
GOOGLE_ANALYTICS_ID=G-PRODUCTION_ID
JWT_SECRET=your_production_secret
```

**Cách thêm**:
1. Project Settings → Environment Variables
2. Thêm từng variable
3. Select environments: Production/Preview/Development
4. Save & Deploy

### Sensitive Data Handling

❌ **KHÔNG bao giờ commit secrets vào Git**

✅ **Cách an toàn**:
1. Gitignore `.env` file
2. Add environment variables qua Vercel Dashboard
3. Hoặc sử dụng Vercel Secrets

## 📦 Database Setup

### MongoDB Atlas + Vercel

1. **Tạo MongoDB Atlas**:
   - Vào https://mongodb.com/cloud/atlas
   - Tạo Cluster (free tier)
   - Tạo User & Password
   - Get Connection String

2. **Add Whitelist IP**:
   - Network Access → Add IP Address
   - Whitelist: `0.0.0.0/0` (hoặc Vercel IPs nếu biết)

3. **Paste Connection String**:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db_name
   ```

### PostgreSQL + Vercel

**Option 1: Railway**
1. Vào https://railway.app
2. Tạo PostgreSQL project
3. Copy connection string
4. Add vào Vercel environment variables

**Option 2: Supabase**
1. Vào https://supabase.com
2. Tạo project
3. Copy connection string
4. Add vào Vercel

## 🔄 Continuous Deployment (CI/CD)

### Automatic Deployment

Vercel **tự động deploy** khi:
- Push code lên branch
- Create pull request
- Merge pull request

### Preview Deployments

Mỗi PR sẽ tạo **Preview URL**:
```
https://sila-[hash].vercel.app
```

Dùng để test trước merge vào main.

### Production Deployment

Merge vào main branch → auto deploy production

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Project Settings → Analytics
2. Enable Vercel Analytics (miễn phí)
3. Monitor:
   - Page load times
   - Web Vitals
   - Error rates

### Google Analytics

1. Add Google Analytics ID vào environment variables
2. Vercel sẽ load script tự động
3. Monitor traffic tại Google Analytics Dashboard

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# Never commit .env file
echo ".env" >> .gitignore
```

### 2. Secrets Management
```
# Vercel Dashboard → Settings → Environment Variables
# Chọn "Sensitive" option
```

### 3. Branch Protection
```
GitHub → Settings → Branches → Add Rule
- Require pull request reviews
- Require status checks to pass
```

### 4. HTTPS
- **Automatic**: Vercel mặc định enable HTTPS
- Force HTTPS: Project Settings → Security

### 5. Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## 🛠️ Troubleshooting

### Build Failed

**Check Logs**:
1. Vercel Dashboard → Deployments
2. Click failed deployment
3. View Build Logs

**Common Issues**:
- Missing environment variables → Add to Vercel
- Syntax errors → Check code & commit fix
- Module not found → Check dependencies

### Site Not Loading

1. Check domain DNS
2. Verify custom domain settings
3. Clear browser cache
4. Check Network tab (F12)

### Environment Variables Not Working

```
Solution:
1. Double-check variable names (case-sensitive)
2. Re-deploy after adding variables
3. Check Preview vs Production environment
```

### Database Connection Error

```
Solution:
1. Verify database connection string
2. Add Vercel IPs to database whitelist
3. Check database is running
4. Increase connection timeout
```

## 📈 Performance Optimization

### Image Optimization

```html
<!-- Use next/image or optimized images -->
<img src="logo.png" alt="SILA" loading="lazy" width="300" height="300">
```

### Caching Strategy

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000" }
      ]
    }
  ]
}
```

### CDN Caching

- Vercel uses **Vercel Edge Network** (global CDN)
- Files automatically cached globally
- No additional config needed

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] All environment variables added
- [ ] Database connection tested
- [ ] Vercel project created
- [ ] Domain configured
- [ ] HTTPS enabled
- [ ] Analytics setup
- [ ] Security headers configured
- [ ] Test deployment URL
- [ ] Test custom domain
- [ ] Monitor initial metrics

## 📞 Deployment Issues?

**Vercel Support**: https://vercel.com/support

**Useful Links**:
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com/
- Community: https://github.com/vercel/community

## 🔄 Auto-deployment with Git

```yaml
# Automatic on push
git push origin main → Auto deploy to production
git push origin feature → Auto create preview
```

## 💡 Pro Tips

1. **Use Preview Deployments**: Test every change on preview URL
2. **Monitor Analytics**: Track performance & user behavior
3. **Enable Auto Rollback**: If deployment fails, auto rollback
4. **Use Environment Variables**: Never hardcode secrets
5. **Regular Backups**: Backup database regularly
6. **Monitor Error Logs**: Setup error tracking (Sentry)

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Setup custom domain
3. ✅ Configure database
4. ✅ Setup monitoring
5. ✅ Launch publicly

---

**Ready to deploy? Let's go! 🚀**
