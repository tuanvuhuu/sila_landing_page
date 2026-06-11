# SILA Infrastructure & Configuration Guide

Hướng dẫn toàn diện cho infrastructure, database, và deployment.

## 📚 Tất cả các File Cấu Hình

| File | Mục đích | Độ ưu tiên |
|------|---------|-----------|
| `.env` | Environment variables (API keys, DB URLs) | 🔴 Critical |
| `vercel.json` | Vercel deployment config | 🔴 Critical |
| `backend-config.js` | Backend configuration | 🟠 High |
| `DATABASE_SCHEMA.md` | Database structure | 🟠 High |
| `VERCEL_DEPLOYMENT.md` | Deployment guide | 🟠 High |
| `INFRASTRUCTURE_GUIDE.md` | This file | 🟡 Medium |

## 🎯 Quick Setup (5 Phút)

### 1. Clone & Setup
```bash
git clone <repo>
cd sila_landing_page
npm install
```

### 2. Configure Environment
```bash
# Copy .env.example → .env
cp .env.example .env

# Edit .env với các giá trị của bạn
nano .env
```

### 3. Setup Database
```bash
# MongoDB Cloud (Quickest)
1. Vào mongodb.com/cloud/atlas
2. Tạo free cluster
3. Copy connection string vào .env
```

### 4. Deploy to Vercel
```bash
1. Vào vercel.com
2. Import project
3. Add environment variables
4. Deploy!
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (Static Site)          │
│  index.html, styles.css, script.js      │
└────────────────┬────────────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │   Vercel (Hosting)    │
     │  + CDN + SSL/TLS      │
     └────────────┬──────────┘
                  │
     ┌────────────┴──────────────────┐
     │                               │
     ▼                               ▼
┌──────────────┐           ┌─────────────────┐
│   Contact    │           │    Analytics    │
│   Form API   │           │  (Google, etc)  │
└──────────────┘           └─────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│        Backend API (Node.js)             │
│  - Express Server                        │
│  - Authentication (JWT)                  │
│  - Email Service (Nodemailer/SendGrid)   │
│  - File Upload (AWS S3 optional)         │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│         Database (Choose One)            │
│  - MongoDB (recommended for MVP)         │
│  - PostgreSQL (production-ready)         │
│  - MySQL (if existing infrastructure)    │
└──────────────────────────────────────────┘
```

## 🗄️ Database Selection Matrix

| Factor | MongoDB | PostgreSQL | MySQL |
|--------|---------|-----------|-------|
| Learning Curve | Easy | Moderate | Easy |
| Development Speed | Fast | Moderate | Moderate |
| Scalability | Excellent | Excellent | Good |
| Relational Data | Poor | Excellent | Good |
| Cost | Free cloud tier | Free options | Free |
| Use Case | MVP, startups | Enterprise | Existing stacks |

## 📋 Step-by-Step Setup

### Phase 1: Local Development (Day 1)

#### 1.1 Setup Node.js
```bash
# Install Node.js 18+
# Download from nodejs.org

# Verify installation
node --version
npm --version
```

#### 1.2 Setup Backend Server
```bash
# Create api folder
mkdir api
cd api

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv mongoose bcryptjs jsonwebtoken nodemailer
```

#### 1.3 Create Backend Files
```bash
# Create folder structure
mkdir routes models controllers middleware config

# Create main server file
touch server.js
```

#### 1.4 Setup Local Database
```bash
# Option A: MongoDB Local
mongod

# Option B: MongoDB Cloud
# Register at mongodb.com/cloud/atlas
# Get connection string
```

#### 1.5 Test Locally
```bash
npm start
# Server should run on http://localhost:5000
```

### Phase 2: Database Configuration (Day 2)

#### 2.1 Choose Database
```javascript
// backend-config.js already has all configs
// Just set DATABASE_TYPE in .env
DATABASE_TYPE=mongodb
```

#### 2.2 Create Collections/Tables
```bash
# MongoDB: Use MongoDB Compass GUI
# PostgreSQL: Use psql CLI
# MySQL: Use MySQL Workbench
```

#### 2.3 Create Indexes
```bash
# For performance optimization
# See DATABASE_SCHEMA.md for index commands
```

### Phase 3: API Development (Day 3-5)

#### 3.1 Contact Form API
```javascript
POST /api/v1/contact
{
    "name": "John",
    "email": "john@example.com",
    "message": "I want to join"
}
```

#### 3.2 Course Management API
```javascript
GET /api/v1/courses
GET /api/v1/courses/:id
POST /api/v1/courses (admin)
PUT /api/v1/courses/:id (admin)
```

#### 3.3 Authentication API
```javascript
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Phase 4: Deployment (Day 6)

#### 4.1 Prepare for Production
```bash
# Update .env with production values
NODE_ENV=production
DATABASE_URI=production_mongodb_uri
JWT_SECRET=strong_production_secret
```

#### 4.2 Deploy to Vercel
```bash
# See VERCEL_DEPLOYMENT.md for detailed steps
```

#### 4.3 Setup Domain
```bash
# Configure custom domain
# Configure SSL/TLS (auto with Vercel)
# Setup DNS records
```

## 🔐 Security Checklist

### Environment Variables
- [ ] Store all secrets in `.env`
- [ ] Never commit `.env` file
- [ ] Use strong JWT secret (min 32 chars)
- [ ] Rotate secrets periodically

### Database Security
- [ ] Use password-protected database
- [ ] Enable encryption at rest
- [ ] Setup IP whitelisting
- [ ] Regular backups
- [ ] Separate dev/prod databases

### API Security
- [ ] Validate all inputs
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Add security headers
- [ ] Use JWT for authentication
- [ ] Hash passwords with bcrypt

### Code Security
- [ ] No hardcoded credentials
- [ ] Validate user inputs
- [ ] Prevent SQL/NoSQL injection
- [ ] Use parameterized queries
- [ ] Sanitize file uploads

## 📊 Monitoring & Logging

### Vercel Monitoring
```
Dashboard → Analytics
- Real-time user metrics
- Page load times
- Error rates
```

### Application Logging
```javascript
// Winston or Bunyan for structured logging
const logger = require('winston');
logger.info('User logged in', { userId: 123 });
```

### Error Tracking
```javascript
// Sentry for error tracking
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Database Monitoring
```bash
# MongoDB Atlas
- Real-time metrics
- Query performance
- Storage tracking

# PostgreSQL
- pg_stat_statements
- slow query logs
- EXPLAIN ANALYZE
```

## 💾 Backup Strategy

### Automated Backups
```bash
# MongoDB Atlas: Automated daily backups
# AWS RDS: Automated snapshots

# Manual backup command:
mongodump --uri="mongodb+srv://..." --out=./backup
```

### Backup Schedule
- Daily automated backups
- Weekly manual backups
- Monthly archive storage

### Disaster Recovery Plan
1. Identify backup location
2. Test restore procedure
3. Document recovery steps
4. Practice quarterly

## 🚀 Performance Optimization

### Frontend
```html
<!-- Lazy load images -->
<img src="logo.png" loading="lazy">

<!-- Minify CSS/JS -->
<!-- Use CDN for assets -->
```

### Backend
```javascript
// Database indexes for frequently queried fields
// Caching with Redis
// API response compression
// Connection pooling
```

### Database
```javascript
// Proper indexing
// Query optimization
// Data archival for old records
// Sharding for large datasets (future)
```

## 📈 Scaling Checklist

**When to Scale**:
- > 1000 users
- > 100,000 page views/month
- Database > 1GB

**Scaling Strategy**:
1. Optimize queries
2. Add caching (Redis)
3. Use CDN
4. Database read replicas
5. Horizontal scaling (multiple instances)

## 🔄 Deployment Workflow

```
Feature Development
        ↓
Create Feature Branch
        ↓
Development & Testing
        ↓
Create Pull Request
        ↓
Code Review
        ↓
Merge to Main
        ↓
Auto Deploy to Vercel (Production)
        ↓
Monitor Metrics & Logs
```

## 📞 Support & Resources

### Official Documentation
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Express Docs: https://expressjs.com/

### Community & Help
- Stack Overflow: [Tag your questions]
- GitHub Issues: [Report bugs]
- Discord Communities: [Join Node.js communities]

### Monitoring Tools
- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogRocket (session replay)
- New Relic (APM)

## 🎓 Learning Resources

### Beginner
- Node.js Tutorial: https://nodejs.dev/
- Express Guide: https://expressjs.com/
- MongoDB Basics: https://university.mongodb.com/

### Intermediate
- Authentication: https://auth0.com/blog/
- API Design: https://swagger.io/
- Database Optimization: [Vendor docs]

### Advanced
- Microservices: Martin Fowler's articles
- Kubernetes: https://kubernetes.io/docs/
- Cloud Architecture: AWS/Azure/GCP docs

## ✅ Final Checklist

- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured
- [ ] Database setup (local & cloud)
- [ ] Backend API running
- [ ] Contact form working
- [ ] Email notifications configured
- [ ] Google Analytics integrated
- [ ] SSL/TLS enabled
- [ ] Security headers added
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Documentation complete
- [ ] Team trained on deployment

---

**Infrastructure Setup Complete! 🎉**

For questions about specific components, refer to:
- Frontend: `CONFIG_QUICK_START.md`
- Database: `DATABASE_SCHEMA.md`
- Deployment: `VERCEL_DEPLOYMENT.md`
