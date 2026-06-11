/**
 * SILA Landing Page Configuration
 * Chỉnh sửa các giá trị trong file này để tùy chỉnh trang web
 */

const CONFIG = {
    // === Thông tin công ty ===
    company: {
        name: 'SILA',
        slogan: 'English Center for Kids and Teens',
        fullName: 'SILA - English Center',
    },

    // === Thông tin liên hệ ===
    contact: {
        address: '123 Đường ABC, Quận 1, TP. HCM',
        phone: '(028) 1234 5678',
        email: 'info@sila.edu.vn',
        hours: 'Thứ 2 - 7: 8:00 - 18:00',
    },

    // === Bảng màu ===
    colors: {
        primaryBlue: '#003D6B',
        secondaryBlue: '#1976D2',
        lightBlue: '#E3F2FD',
        gold: '#FFB81C',
        white: '#FFFFFF',
        darkGray: '#333333',
        lightGray: '#F5F5F5',
        borderColor: '#E0E0E0',
    },

    // === Thông tin trang web ===
    seo: {
        title: 'SILA - English Center for Kids and Teens',
        description: 'SILA English Center - Trung tâm tiếng Anh hàng đầu cho trẻ em và thanh thiếu niên',
        keywords: 'tiếng Anh, SILA, trẻ, thanh thiếu niên, luyện thi',
        author: 'SILA English Center',
        language: 'vi',
    },

    // === Google Analytics ===
    analytics: {
        googleAnalyticsId: '', // Ví dụ: 'G-XXXXXXXXXX'
        facebookPixelId: '',   // Ví dụ: '123456789'
    },

    // === API Endpoints ===
    api: {
        contactFormUrl: 'https://your-backend.com/api/contact',
        // Để tắt form submission thực tế, set thành null
        // contactFormUrl: null,
    },

    // === Social Media Links ===
    social: {
        facebook: 'https://facebook.com/sila',
        instagram: 'https://instagram.com/sila',
        twitter: 'https://twitter.com/sila',
        youtube: 'https://youtube.com/sila',
    },

    // === Features Toggle ===
    features: {
        enableAnimations: true,
        enableFormSubmission: true,
        enableAnalytics: false,
        maintenanceMode: false,
    },

    // === Thống kê (Stats) ===
    stats: {
        students: '5000+',
        teachers: '50+',
        experience: '10+',
        satisfaction: '95%',
    },

    // === Khóa học (Programs) ===
    programs: [
        {
            title: 'Khóa học cho trẻ',
            description: 'Chương trình tiếng Anh chuyên biệt cho trẻ em từ 4-7 tuổi với các hoạt động vui nhộn và tương tác.',
            icon: 'fas fa-child',
        },
        {
            title: 'Khóa học cho thanh thiếu niên',
            description: 'Lớp học nâng cao cho học sinh từ 8-15 tuổi với các bài tập thực tế và chuẩn bị kỳ thi.',
            icon: 'fas fa-graduation-cap',
        },
        {
            title: 'Khóa học luyện thi',
            description: 'Chuẩn bị cho các kỳ thi quốc tế như TOEFL, IELTS với giáo viên bản xứ.',
            icon: 'fas fa-book',
        },
        {
            title: 'Lớp học trực tuyến',
            description: 'Học tiếng Anh từ nhà với sự linh hoạt về thời gian và không gian.',
            icon: 'fas fa-video',
        },
        {
            title: 'Lớp nhóm nhỏ',
            description: 'Tối đa 6-8 học sinh mỗi lớp để đảm bảo sự chú ý cá nhân.',
            icon: 'fas fa-users',
        },
        {
            title: 'Khóa hè đặc biệt',
            description: 'Các khóa hè thú vị với kết hợp giáo dục và hoạt động vui chơi.',
            icon: 'fas fa-star',
        },
    ],

    // === Ưu điểm (Features) ===
    featuresList: [
        {
            icon: 'fas fa-headphones',
            title: 'Giáo dục tương tác',
            description: 'Các bài học được thiết kế để tương tác cao, giữ cho học sinh tập trung và hứng thú.',
        },
        {
            icon: 'fas fa-globe',
            title: 'Tiêu chuẩn quốc tế',
            description: 'Chương trình giảng dạy theo tiêu chuẩn CEFR quốc tế.',
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Theo dõi tiến độ',
            description: 'Báo cáo chi tiết hàng tháng về tiến độ học tập của con em.',
        },
        {
            icon: 'fas fa-calendar-alt',
            title: 'Lịch học linh hoạt',
            description: 'Các lớp học có thể được sắp xếp theo nhu cầu của từng gia đình.',
        },
    ],

    // === Nhận xét (Testimonials) ===
    testimonials: [
        {
            stars: 5,
            text: 'Con tôi rất yêu thích học tiếng Anh tại SILA. Các giáo viên rất thân thiện và kiên nhẫn.',
            author: 'Nguyễn Minh Tú',
            role: 'Phụ huynh',
        },
        {
            stars: 5,
            text: 'Chất lượng giáo dục rất cao, con tôi đã cải thiện điểm tiếng Anh đáng kể.',
            author: 'Trần Văn Dũng',
            role: 'Phụ huynh',
        },
        {
            stars: 5,
            text: 'Cơ sở vật chất tuyệt vời, các hoạt động ngoại khoá rất bổ ích và vui vẻ.',
            author: 'Lê Thị Hương',
            role: 'Phụ huynh',
        },
    ],

    // === Thông tin công ty (About) ===
    about: {
        title: 'Tại sao chọn SILA?',
        highlights: [
            'Giáo viên bản xứ với chứng chỉ quốc tế',
            'Phương pháp giảng dạy hiện đại và sáng tạo',
            'Cơ sở vật chất hiện đại với đầy đủ trang thiết bị',
            'Đội ngũ hỗ trợ tận tâm 24/7',
            'Kết quả học tập được chứng minh qua các kỳ thi',
            'Cộng đồng học tập thân thiện và hỗ trợ',
        ],
    },

    // === Footer ===
    footer: {
        year: new Date().getFullYear(),
        copyright: '© 2024 SILA English Center. All rights reserved.',
    },
};

// Export cho Node.js (nếu cần)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
