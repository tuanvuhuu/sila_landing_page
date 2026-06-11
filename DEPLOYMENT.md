# SILA Landing Page - Deployment Guide

## 📋 Triển khai Locally

### 1. Sử dụng Python (Đơn giản nhất)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Sau đó truy cập: `http://localhost:8000`

### 2. Sử dụng Node.js
```bash
# Cài đặt http-server globally (nếu chưa có)
npm install -g http-server

# Chạy server
http-server -p 8000
```
Sau đó truy cập: `http://localhost:8000`

### 3. Sử dụng VS Code Live Server Extension
1. Cài đặt "Live Server" extension
2. Right-click trên `index.html`
3. Chọn "Open with Live Server"

### 4. Sử dụng npm start
```bash
npm start
```

## 🌐 Triển khai trên Internet

### Tùy chọn 1: Netlify (Khuyến khích - Miễn phí)
1. Đăng ký tài khoản tại [netlify.com](https://netlify.com)
2. Kết nối GitHub repository
3. Chọn `claude/esl-landing-page-clone-3clo3i` branch
4. Set Build command: (để trống)
5. Set Publish directory: `.` (hoặc root)
6. Click Deploy

### Tùy chọn 2: GitHub Pages
1. Push code lên GitHub
2. Vào Settings > Pages
3. Chọn branch `claude/esl-landing-page-clone-3clo3i`
4. Chọn root folder
5. Lưu và chờ deployment

### Tùy chọn 3: Vercel
1. Đăng ký tại [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Vercel sẽ tự động detect
4. Click Deploy

### Tùy chọn 4: Hosting Services Khác
- **000webhost** (Miễn phí với ads)
- **Hostinger** (Chất lượng cao, giá rẻ)
- **Bluehost** (Đáng tin cậy)
- **SiteGround** (Premium support)
- **AWS S3 + CloudFront**

## 📝 Cấu hình Trước Triển khai

### 1. Cập nhật Thông tin Công ty
Mở `index.html` và thay đổi:
```html
<!-- Địa chỉ -->
<p>123 Đường ABC, Quận 1, TP. HCM</p>

<!-- Điện thoại -->
<p>(028) 1234 5678</p>

<!-- Email -->
<p>info@sila.edu.vn</p>

<!-- Giờ làm việc -->
<p>Thứ 2 - 7: 8:00 - 18:00</p>
```

### 2. Cập nhật Form Submission
Mở `script.js` và cập nhật hàm `contactForm` để gửi dữ liệu đến server của bạn:
```javascript
// Thay đổi từ console.log thành API call
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
})
```

### 3. Tối ưu hóa SEO
Cập nhật trong `<head>` của `index.html`:
```html
<meta name="description" content="SILA English Center - Trung tâm tiếng Anh cho trẻ em và thanh thiếu niên">
<meta name="keywords" content="tiếng Anh, SILA, trẻ em, thanh thiếu niên">
<meta name="author" content="SILA English Center">
```

## 🔒 Security Best Practices

1. **HTTPS**: Luôn sử dụng HTTPS (hỗ trợ tự động từ Netlify/Vercel)
2. **Form Validation**: Kiểm tra input trên server
3. **CORS**: Cấu hình CORS headers đúng nếu có backend API
4. **Privacy Policy**: Thêm link privacy policy ở footer

## 📊 Analytics Setup

### Google Analytics
1. Đăng ký tại [google.com/analytics](https://google.com/analytics)
2. Tạo property mới
3. Thêm vào `<head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 🚀 Performance Tips

1. **Tối ưu hóa Logo**:
   - Nén ảnh sử dụng TinyPNG
   - Xem xét chuyển sang WebP

2. **Lazy Loading Images**:
   ```html
   <img src="logo.png" alt="SILA" loading="lazy">
   ```

3. **Minify CSS/JS**:
   - Sử dụng tools như minify.js.org

4. **Caching**:
   - Netlify/Vercel xử lý tự động
   - Cấu hình cache headers nếu cần

## 📱 Mobile Testing

Trước triển khai, test trên:
- iPhone/iPad (Safari)
- Android devices (Chrome)
- Tablet devices
- Desktop browsers

Sử dụng Chrome DevTools (F12 > Toggle device toolbar)

## 🐛 Troubleshooting

### Form không gửi được
- Kiểm tra browser console (F12)
- Đảm bảo tất cả input fields có `name` attribute

### Styling không đúng
- Clear browser cache (Ctrl+Shift+Delete)
- Kiểm tra styles.css được load đúng

### Logo không hiển thị
- Kiểm tra logo.png tồn tại
- Kiểm tra đường dẫn đúng

### JavaScript không chạy
- Kiểm tra script.js được load
- Mở DevTools xem error messages

## 📧 Liên hệ & Support

Nếu cần hỗ trợ thêm hoặc có câu hỏi:
- Email: tuanvuhuu2798@gmail.com
- GitHub: https://github.com/tuanvuhuu/sila_landing_page

## ✅ Checklist Trước Launch

- [ ] Cập nhật tất cả thông tin công ty
- [ ] Test trên các trình duyệt khác nhau
- [ ] Test trên mobile devices
- [ ] Kiểm tra tất cả links hoạt động
- [ ] Tối ưu hóa ảnh
- [ ] Cấu hình domain name
- [ ] Setup SSL certificate
- [ ] Cấu hình email cho form
- [ ] Setup Google Analytics
- [ ] Test form submission
- [ ] Kiểm tra SEO metadata
- [ ] Cập nhật footer với năm hiện tại
