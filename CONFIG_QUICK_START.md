# Config Quick Start Guide

## 🚀 Cách Sử Dụng Nhanh

### Bước 1: Mở file `config.js`

### Bước 2: Sửa các thông tin cơ bản

```javascript
// Thông tin công ty
company: {
    name: 'SILA',  // 👈 Sửa tên công ty
    slogan: 'English Center for Kids and Teens',
},

// Thông tin liên hệ
contact: {
    address: '123 Đường ABC, Quận 1, TP. HCM',  // 👈 Sửa địa chỉ
    phone: '(028) 1234 5678',                     // 👈 Sửa phone
    email: 'info@sila.edu.vn',                    // 👈 Sửa email
    hours: 'Thứ 2 - 7: 8:00 - 18:00',            // 👈 Sửa giờ làm việc
},
```

### Bước 3: Đổi màu sắc (nếu cần)

```javascript
colors: {
    primaryBlue: '#003D6B',    // 👈 Đổi xanh chính
    gold: '#FFB81C',           // 👈 Đổi vàng gold
    // ... các màu khác
},
```

### Bước 4: Cập nhật social media

```javascript
social: {
    facebook: 'https://facebook.com/your-page',    // 👈 Sửa Facebook
    instagram: 'https://instagram.com/your-page',  // 👈 Sửa Instagram
    // ...
},
```

### Bước 5: Lưu file & test

```bash
# Test locally
python -m http.server 8000

# Mở http://localhost:8000 trong browser
```

## 📋 Các Cấu Hình Quan Trọng

| Cấu hình | Vị trí | Mục đích |
|---------|--------|---------|
| `company.name` | config.js | Tên công ty hiển thị ở navbar |
| `contact.*` | config.js | Thông tin liên hệ |
| `colors.*` | config.js | Bảng màu toàn site |
| `seo.*` | config.js | Tiêu đề & meta tags |
| `social.*` | config.js | Links mạng xã hội |
| `programs[]` | config.js | Danh sách khóa học |
| `stats.*` | config.js | Thống kê (5000+ học sinh, v.v.) |

## 🎯 Ví Dụ Thực Tế

### Thay đổi tên công ty từ "SILA" thành "ABC English"

```javascript
company: {
    name: 'ABC English',  // ✅ Thay đổi
    slogan: 'English Center for Kids and Teens',
}
```

### Thêm khóa học mới

```javascript
programs: [
    // ... khóa học hiện tại
    {
        title: 'Khóa học 1-1',                    // ✅ Tên khóa học
        description: 'Dạy kèm riêng từng học sinh',  // ✅ Mô tả
        icon: 'fas fa-user-tie',                  // ✅ Icon (từ Font Awesome)
    },
]
```

### Bật form submission tới API

```javascript
features: {
    enableFormSubmission: true,
},

api: {
    contactFormUrl: 'https://your-backend.com/api/contact',
},
```

## ✨ Advanced Features

### 1. Google Analytics
```javascript
features: {
    enableAnalytics: true,
},
analytics: {
    googleAnalyticsId: 'G-ABC123',  // 👈 Paste ID từ Google Analytics
},
```

### 2. Maintenance Mode
```javascript
features: {
    maintenanceMode: true,  // Hiển thị warning banner
},
```

### 3. Tắt animations (để trang load nhanh hơn)
```javascript
features: {
    enableAnimations: false,
},
```

## 🔍 Xem Thay Đổi Ngay

1. Sửa `config.js`
2. Reload trang trong browser (Ctrl+R hoặc Cmd+R)
3. Nếu không thấy thay đổi → **Clear cache** (Ctrl+Shift+Delete)

## 🆘 Gặp Lỗi?

**Q: Thay đổi không hiển thị?**
- Clear browser cache
- Reload trang (Ctrl+F5)

**Q: Syntax error?**
- Kiểm tra dấu phẩy (`,`) đúng không
- Kiểm tra dấu ngoặc `{}` đóng mở đúng không
- Mở DevTools (F12) xem error

**Q: Màu sắc không đổi?**
- Kiểm tra format: `#RRGGBB` (6 ký tự)
- Ví dụ: `#FF0000` (đỏ), `#00FF00` (xanh), `#0000FF` (xanh dương)

## 📚 Tìm Icon Font Awesome

Vào https://fontawesome.com/icons để tìm icon:
- Tìm icon muốn dùng
- Copy class name (ví dụ: `fa-graduation-cap`)
- Dùng: `icon: 'fas fa-graduation-cap'`

## 🚀 Deploy Thay Đổi

```bash
git add config.js
git commit -m "Update configuration"
git push origin <branch-name>
```

---

**Xem chi tiết hơn:** Đọc file `CONFIGURATION.md`
