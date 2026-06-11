# SILA Landing Page - Database Schema

Hướng dẫn cấu hình database cho SILA English Center backend.

## 📦 Chọn Database

### Khuyến Cáo
- **MongoDB**: Phát triển nhanh, flexible, JSON-like
- **PostgreSQL**: Enterprise, scalable, ACID compliant, safe
- **MySQL**: Popular, stable, chi phí thấp

## 🔧 Cài Đặt Database

### 1. MongoDB (Khuyến Cáo cho MVP)

#### A. Local Development
```bash
# Cài đặt MongoDB Community Edition
# macOS:
brew install mongodb-community

# Windows: Download từ https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Connect dengan MongoDB Compass hoặc CLI
mongo
```

#### B. Cloud (Atlas - Miễn phí)
1. Đăng ký tại https://www.mongodb.com/cloud/atlas
2. Tạo Cluster (chọn free tier)
3. Lấy connection string
4. Paste vào `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sila_db?retryWrites=true&w=majority
```

### 2. PostgreSQL

#### A. Local Development
```bash
# macOS:
brew install postgresql

# Windows: Download từ https://www.postgresql.org/download/

# Start PostgreSQL
brew services start postgresql

# Create database
createdb sila_db

# Connect
psql -d sila_db
```

#### B. Cloud (Heroku, Railway, Supabase)
**Railway** (Khuyến cáo):
1. Đăng ký tại https://railway.app
2. Tạo PostgreSQL project
3. Copy connection string vào `.env`

**Supabase** (miễn phí):
1. Đăng ký tại https://supabase.com
2. Tạo project
3. Copy connection info vào `.env`

### 3. MySQL

#### A. Local Development
```bash
# macOS:
brew install mysql

# Start MySQL
brew services start mysql

# Secure installation
mysql_secure_installation

# Create database
mysql -u root -p
CREATE DATABASE sila_db;
CREATE USER 'sila_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON sila_db.* TO 'sila_user'@'localhost';
FLUSH PRIVILEGES;
```

#### B. Cloud (AWS RDS, Google Cloud SQL)

## 📊 Collections/Tables Structure

### MongoDB Collections

#### 1. Users Collection
```javascript
{
    _id: ObjectId,
    email: String (unique),
    password: String (hashed),
    fullName: String,
    phone: String,
    role: String (admin, teacher, student, parent),
    avatar: String (URL),
    address: String,
    registeredAt: Date,
    lastLogin: Date,
    isActive: Boolean,
    verificationToken: String,
    isEmailVerified: Boolean,
    metadata: {
        country: String,
        language: String,
        timezone: String,
    },
    createdAt: Date,
    updatedAt: Date,
}
```

#### 2. Courses Collection
```javascript
{
    _id: ObjectId,
    courseCode: String (unique),
    name: String,
    description: String,
    category: String (kids, teens, exam_prep, online),
    level: String (beginner, intermediate, advanced),
    price: Number,
    duration: Number (weeks),
    schedule: {
        days: Array (Mon, Tue, Wed, ...),
        time: String (10:00-11:00),
        location: String,
    },
    maxStudents: Number,
    currentStudents: Number,
    teacher: ObjectId (ref: User),
    image: String (URL),
    materials: Array (URLs),
    startDate: Date,
    endDate: Date,
    isActive: Boolean,
    ratings: Array,
    createdAt: Date,
    updatedAt: Date,
}
```

#### 3. Enrollments Collection
```javascript
{
    _id: ObjectId,
    student: ObjectId (ref: User),
    course: ObjectId (ref: Course),
    enrollmentDate: Date,
    status: String (active, completed, dropped),
    progress: {
        lessonsCompleted: Number,
        totalLessons: Number,
        percentage: Number,
        lastAccessed: Date,
    },
    grade: String (A, B, C, ...),
    attendance: Array,
    notes: String,
    createdAt: Date,
    updatedAt: Date,
}
```

#### 4. ContactForms Collection
```javascript
{
    _id: ObjectId,
    name: String,
    email: String,
    phone: String,
    subject: String,
    message: String,
    status: String (new, reading, replied, closed),
    reply: String,
    submittedAt: Date,
    repliedAt: Date,
}
```

#### 5. Lessons Collection
```javascript
{
    _id: ObjectId,
    course: ObjectId (ref: Course),
    title: String,
    description: String,
    content: String,
    order: Number,
    duration: Number (minutes),
    materials: Array ({
        type: String (video, document, quiz),
        url: String,
        title: String,
    }),
    isPublished: Boolean,
    createdAt: Date,
    updatedAt: Date,
}
```

#### 6. Payments Collection
```javascript
{
    _id: ObjectId,
    user: ObjectId (ref: User),
    course: ObjectId (ref: Course),
    amount: Number,
    currency: String,
    status: String (pending, completed, failed, refunded),
    paymentMethod: String (stripe, bank_transfer),
    transactionId: String,
    invoice: String,
    paidAt: Date,
    createdAt: Date,
}
```

### SQL (PostgreSQL/MySQL) Tables

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('admin', 'teacher', 'student', 'parent') DEFAULT 'student',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    level VARCHAR(50),
    price DECIMAL(10, 2),
    duration INT,
    teacher_id INT,
    max_students INT,
    current_students INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Enrollments Table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    progress_percentage INT DEFAULT 0,
    grade VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Contact Forms Table
CREATE TABLE contact_forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'reading', 'replied', 'closed') DEFAULT 'new',
    reply TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons Table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    lesson_order INT,
    duration INT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    invoice_number VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

## 🚀 Indexes (Performance)

### MongoDB
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Courses
db.courses.createIndex({ courseCode: 1 }, { unique: true });
db.courses.createIndex({ category: 1 });

// Enrollments
db.enrollments.createIndex({ student: 1, course: 1 }, { unique: true });
db.enrollments.createIndex({ status: 1 });

// ContactForms
db.contact_forms.createIndex({ email: 1 });
db.contact_forms.createIndex({ submittedAt: -1 });
```

### PostgreSQL/MySQL
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_contact_forms_email ON contact_forms(email);
```

## 📝 Sample Data

### Insert Sample Courses (MongoDB)
```javascript
db.courses.insertMany([
    {
        courseCode: 'KIDS-001',
        name: 'Khóa học cho trẻ',
        category: 'kids',
        level: 'beginner',
        price: 299,
        duration: 12,
        maxStudents: 10,
    },
    {
        courseCode: 'TEENS-001',
        name: 'Khóa học cho thanh thiếu niên',
        category: 'teens',
        level: 'intermediate',
        price: 399,
        duration: 16,
        maxStudents: 12,
    },
])
```

## 🔐 Security

1. **Hash Passwords**: Sử dụng bcrypt
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **Validate Input**: Kiểm tra input dữ liệu
3. **HTTPS Only**: Enforce HTTPS
4. **SQL Injection Prevention**: Sử dụng prepared statements
5. **NoSQL Injection Prevention**: Validate types

## 🧪 Testing Database

```bash
# Test MongoDB Connection
node -e "
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
client.connect().then(() => {
  console.log('MongoDB connected!');
  client.close();
}).catch(err => console.error(err));
"

# Test PostgreSQL Connection
psql -h localhost -U sila_user -d sila_db -c "SELECT 1;"
```

## 📚 Migration Tools

### MongoDB
- **Mongoose**: ORM for MongoDB
- **Migration Tools**: db-migrate

### PostgreSQL/MySQL
- **Sequelize**: ORM
- **TypeORM**: ORM with TypeScript
- **Knex.js**: Query builder + migrations

## 🔄 Backup & Recovery

### MongoDB
```bash
# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/db" --out=./backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/db" ./backup
```

### PostgreSQL
```bash
# Backup
pg_dump -h localhost -U sila_user -d sila_db > backup.sql

# Restore
psql -h localhost -U sila_user -d sila_db < backup.sql
```

---

**Chọn database phù hợp với nhu cầu của bạn!**
