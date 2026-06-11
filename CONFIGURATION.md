# SILA Landing Page - Configuration Guide

Hướng dẫn cấu hình chi tiết cho SILA Landing Page.

## 📝 Cách Cấu Hình

Tất cả các cấu hình được quản lý trong file `config.js`. Bạn chỉ cần sửa các giá trị trong file này mà không cần chỉnh sửa HTML hay CSS.

## 🔧 File Cấu Hình

### `config.js` - Main Configuration File
File này chứa tất cả các cấu hình chính. Bạn có thể sửa trực tiếp các giá trị ở đây.

### `.env.example` - Environment Variables Template
File mẫu hiển thị tất cả các biến có thể cấu hình. Copy nội dung này vào `.env` file nếu bạn muốn quản lý qua environment variables.

## 📋 Các Phần Cấu Hình

### 1. Company Information (Thông tin công ty)

```javascript
company: {
    name: 'SILA',
    slogan: 'English Center for Kids and Teens',
    fullName: 'SILA - English Center',
}
```

**Sửa:**
- `name`: Tên công ty (hiển thị ở navbar)
- `slogan`: Slogan ngắn
- `fullName`: Tên đầy đủ

### 2. Contact Information (Thông tin liên hệ)

```javascript
contact: {
    address: '123 Đường ABC, Quận 1, TP. HCM',
    phone: '(028) 1234 5678',
    email: 'info@sila.edu.vn',
    hours: 'Thứ 2 - 7: 8:00 - 18:00',
}
```

**Sửa:**
- `address`: Địa chỉ công ty
- `phone`: Số điện thoại
- `email`: Email liên hệ
- `hours`: Giờ làm việc

### 3. Color Scheme (Bảng màu)

```javascript
colors: {
    primaryBlue: '#003D6B',      // Xanh dương chính
    secondaryBlue: '#1976D2',    // Xanh dương phụ
    lightBlue: '#E3F2FD',        // Xanh dương nhạt
    gold: '#FFB81C',             // Vàng gold
    white: '#FFFFFF',            // Trắng
    darkGray: '#333333',         // Xám đậm
    lightGray: '#F5F5F5',        // Xám nhạt
    borderColor: '#E0E0E0',      // Đường viền
}
```

**Sửa:**
- Thay đổi mã màu hex cho màu tương ứng
- Ví dụ để đổi màu xanh chính: `primaryBlue: '#0066CC'`

### 4. SEO Configuration (Cấu hình SEO)

```javascript
seo: {
    title: 'SILA - English Center for Kids and Teens',
    description: 'SILA English Center - Trung tâm tiếng Anh hàng đầu...',
    keywords: 'tiếng Anh, SILA, trẻ, thanh thiếu niên, luyện thi',
    author: 'SILA English Center',
    language: 'vi',
}
```

**Sửa:**
- `title`: Tiêu đề trang (hiển thị trong browser tab)
- `description`: Mô tả meta (hiển thị trong Google search)
- `keywords`: Từ khóa SEO
- `author`: Tác giả
- `language`: Ngôn ngữ trang (en, vi, etc.)

### 5. Analytics Configuration (Cấu hình phân tích)

```javascript
analytics: {
    googleAnalyticsId: '',        // Ví dụ: 'G-XXXXXXXXXX'
    facebookPixelId: '',          // Ví dụ: '123456789'
}
```

**Sửa:**
1. Đăng ký Google Analytics: https://google.com/analytics
2. Tìm Measurement ID (dạng: `G-XXXXXXXXXX`)
3. Paste vào `googleAnalyticsId`
4. Tương tự với Facebook Pixel

### 6. API Endpoints (Điểm cuối API)

```javascript
api: {
    contactFormUrl: 'https://your-backend.com/api/contact',
}
```

**Sửa:**
- `contactFormUrl`: URL endpoint để xử lý form submission
- Set `null` để tắt form submission thực tế (chỉ demo)
- Ví dụ backend: Node.js, Python Flask, PHP, etc.

### 7. Social Media Links (Link mạng xã hội)

```javascript
social: {
    facebook: 'https://facebook.com/sila',
    instagram: 'https://instagram.com/sila',
    twitter: 'https://twitter.com/sila',
    youtube: 'https://youtube.com/sila',
}
```

**Sửa:**
- Thay đổi URL với các tài khoản của bạn
- Để trống nếu không có tài khoản

### 8. Features Toggle (Bật/Tắt tính năng)

```javascript
features: {
    enableAnimations: true,
    enableFormSubmission: true,
    enableAnalytics: false,
    maintenanceMode: false,
}
```

**Sửa:**
- `enableAnimations`: Bật/tắt hiệu ứng động
- `enableFormSubmission`: Bật/tắt gửi form
- `enableAnalytics`: Bật/tắt tracking
- `maintenanceMode`: Chế độ bảo trì (hiển thị warning banner)

### 9. Statistics (Thống kê)

```javascript
stats: {
    students: '5000+',
    teachers: '50+',
    experience: '10+',
    satisfaction: '95%',
}
```

**Sửa:**
- Cập nhật con số thống kê của bạn

### 10. Programs (Khóa học)

```javascript
programs: [
    {
        title: 'Khóa học cho trẻ',
        description: 'Chương trình tiếng Anh chuyên biệt...',
        icon: 'fas fa-child',
    },
    // ... thêm khóa học khác
]
```

**Sửa:**
- Thêm/xóa khóa học bằng cách thêm/xóa object trong array
- Thay đổi `title` và `description`
- Thay đổi `icon` từ Font Awesome (danh sách: https://fontawesome.com/icons)

### 11. Features List (Danh sách ưu điểm)

```javascript
featuresList: [
    {
        icon: 'fas fa-headphones',
        title: 'Giáo dục tương tác',
        description: 'Các bài học được thiết kế để tương tác cao...',
    },
    // ... thêm ưu điểm khác
]
```

**Sửa:**
- Thêm/xóa ưu điểm
- Thay đổi icon, tiêu đề, mô tả

### 12. Testimonials (Nhận xét)

```javascript
testimonials: [
    {
        stars: 5,
        text: 'Con tôi rất yêu thích học tiếng Anh tại SILA...',
        author: 'Nguyễn Minh Tú',
        role: 'Phụ huynh',
    },
    // ... thêm nhận xét khác
]
```

**Sửa:**
- Thêm/xóa nhận xét
- Thay đổi `stars` (1-5)
- Thay đổi `text`, `author`, `role`

### 13. About Section (Thông tin về công ty)

```javascript
about: {
    title: 'Tại sao chọn SILA?',
    highlights: [
        'Giáo viên bản xứ với chứng chỉ quốc tế',
        'Phương pháp giảng dạy hiện đại và sáng tạo',
        // ... thêm điểm nổi bật khác
    ],
}
```

**Sửa:**
- Thay đổi `title`
- Thêm/xóa điểm nổi bật trong array

### 14. Footer Configuration

```javascript
footer: {
    year: new Date().getFullYear(),
    copyright: '© 2024 SILA English Center. All rights reserved.',
}
```

**Sửa:**
- `year`: Tự động cập nhật năm hiện tại
- `copyright`: Văn bản copyright

## 🎨 Ví Dụ Tùy Chỉnh

### Ví dụ 1: Đổi Bảng Màu Toàn Bộ

```javascript
colors: {
    primaryBlue: '#1a237e',        // Xanh dương đậm hơn
    secondaryBlue: '#3f51b5',      // Indigo
    lightBlue: '#e8eaf6',          // Indigo nhạt
    gold: '#ffc107',               // Amber
    // ... giữ nguyên các màu khác
}
```

### Ví dụ 2: Thêm Khóa Học Mới

```javascript
programs: [
    // ... khóa học hiện tại
    {
        title: 'Khóa học 1-1',
        description: 'Dạy kèm riêng từng học sinh với lộ trình cá nhân hóa',
        icon: 'fas fa-user-tie',
    },
]
```

### Ví dụ 3: Bật Analytics & Form Submission

```javascript
features: {
    enableFormSubmission: true,
    enableAnalytics: true,
    // ...
},

analytics: {
    googleAnalyticsId: 'G-ABC123XYZ',
    facebookPixelId: '123456789',
},

api: {
    contactFormUrl: 'https://your-server.com/api/contact',
},
```

### Ví dụ 4: Chế Độ Bảo Trì

```javascript
features: {
    maintenanceMode: true,  // Trang sẽ hiển thị warning banner
    // ...
}
```

## ✅ Quick Setup Checklist

- [ ] Sửa `company.name` và `company.slogan`
- [ ] Cập nhật `contact` (địa chỉ, phone, email, hours)
- [ ] Thay đổi `colors` để phù hợp với brand
- [ ] Cập nhật `seo.title` và `seo.description`
- [ ] Thay đổi `social` links với tài khoản thật
- [ ] Cập nhật `stats` với con số thật
- [ ] Sửa `programs` list
- [ ] Sửa `features` list
- [ ] Cập nhật `testimonials`
- [ ] Sửa `about.highlights`
- [ ] Nếu có backend: cập nhật `api.contactFormUrl`
- [ ] Nếu muốn tracking: thêm `googleAnalyticsId`

## 🔐 Security Notes

- **Đừng** để API credentials, API keys, hoặc sensitive data trong `config.js`
- Nếu cần API key riêng: tạo `.env` file và load nó từ backend
- Form submission nên validate trên server, không chỉ client

## 📱 Responsive Tips

Các cấu hình không ảnh hưởng đến responsive design. Trang web tự động responsive với desktop, tablet, mobile.

## 🚀 Deploy với Config Mới

1. Chỉnh sửa `config.js`
2. Test locally: `python -m http.server 8000`
3. Commit: `git add config.js && git commit -m "Update configuration"`
4. Push: `git push origin <branch-name>`
5. Deploy sẽ tự động cập nhật

## ❓ Troubleshooting

### Thay đổi không có hiệu lực
- Clear browser cache (Ctrl+Shift+Delete)
- Reload trang (Ctrl+F5)
- Kiểm tra console (F12) có error không

### Màu sắc không đổi
- Kiểm tra syntax hex color có đúng (#RRGGBB)
- Đảm bảo giá trị là string (có dấu ngoặc kép)

### Form không gửi
- Kiểm tra `api.contactFormUrl` có đúng không
- Kiểm trace Network tab (F12) xem request

## 📚 Thêm Tài Liệu

- Font Awesome Icons: https://fontawesome.com/icons
- Color Picker: https://htmlcolorcodes.com/
- SEO Guide: https://www.google.com/search/howsearchworks/

---

**Cần giúp đỡ?** Liên hệ: info@sila.edu.vn
