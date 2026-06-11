// ===== Configuration Loader =====
// Cập nhật DOM dựa trên CONFIG
function applyConfig() {
    if (typeof CONFIG === 'undefined') {
        console.warn('CONFIG not loaded');
        return;
    }

    // Áp dụng các biến màu sắc
    const style = document.documentElement.style;
    Object.entries(CONFIG.colors).forEach(([key, value]) => {
        const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
        style.setProperty(cssVar, value);
    });

    // Cập nhật tiêu đề và thông tin công ty
    document.title = CONFIG.seo.title;

    // Cập nhật các phần tử với class data-config
    updateElementsFromConfig();

    // Cấu hình analytics nếu bật
    if (CONFIG.features.enableAnalytics && CONFIG.analytics.googleAnalyticsId) {
        loadGoogleAnalytics(CONFIG.analytics.googleAnalyticsId);
    }

    // Cấu hình maintenance mode
    if (CONFIG.features.maintenanceMode) {
        showMaintenanceMessage();
    }
}

// Cập nhật các phần tử dựa trên CONFIG
function updateElementsFromConfig() {
    // Cập nhật contact info
    const contactInfo = document.querySelectorAll('[data-config]');
    contactInfo.forEach(el => {
        const key = el.getAttribute('data-config');
        const value = getConfigValue(key);
        if (value) el.textContent = value;
    });
}

// Lấy giá trị từ CONFIG dùng dot notation (ví dụ: 'contact.phone')
function getConfigValue(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
}

// Load Google Analytics
function loadGoogleAnalytics(id) {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', id);
}

// Hiển thị thông báo maintenance mode
function showMaintenanceMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 9999;
        font-weight: bold;
    `;
    message.textContent = '⚠️ Trang web đang bảo trì. Vui lòng quay lại sau.';
    document.body.prepend(message);
}

// Chạy cấu hình khi trang load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyConfig);
} else {
    applyConfig();
}

// ===== Mobile Menu Toggle =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
            if (hamburger) hamburger.classList.remove('active');
        }
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// CTA Button Click Handler
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Form Submission Handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Kiểm tra cấu hình form submission
        if (CONFIG && CONFIG.features.enableFormSubmission && CONFIG.api.contactFormUrl) {
            // Gửi đến API backend
            submitBtn.textContent = 'Đang gửi...';
            submitBtn.disabled = true;

            fetch(CONFIG.api.contactFormUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            })
            .then(response => response.json())
            .then(data => {
                console.log('Form submitted successfully:', data);
                submitBtn.textContent = 'Cảm ơn! Chúng tôi sẽ liên hệ sớm.';
                submitBtn.style.backgroundColor = '#4CAF50';
                contactForm.reset();
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            })
            .catch(error => {
                console.error('Form submission error:', error);
                submitBtn.textContent = 'Lỗi! Vui lòng thử lại.';
                submitBtn.style.backgroundColor = '#f44336';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            });
        } else {
            // Chế độ demo - chỉ hiển thị thông báo
            console.log('Form submitted (demo mode):', Object.fromEntries(formData));
            submitBtn.textContent = 'Cảm ơn! Chúng tôi sẽ liên hệ sớm.';
            submitBtn.style.backgroundColor = '#4CAF50';
            contactForm.reset();
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
            }, 3000);
        }
    });
}

// Add scroll animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.program-card, .feature, .testimonial-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = '#FFB81C';
        } else {
            link.style.color = '';
        }
    });
});

// Add counter animation for stats
const statItems = document.querySelectorAll('.stat-item h4');
let counted = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
            counted = true;
            statItems.forEach(stat => {
                const finalValue = stat.textContent;
                const numericValue = parseInt(finalValue);

                if (!isNaN(numericValue)) {
                    const duration = 2000; // 2 seconds
                    const increment = numericValue / (duration / 16);
                    let current = 0;

                    const counter = setInterval(() => {
                        current += increment;
                        if (current >= numericValue) {
                            stat.textContent = finalValue;
                            clearInterval(counter);
                        } else {
                            stat.textContent = Math.floor(current) + (finalValue.includes('+') ? '+' : '');
                        }
                    }, 16);
                }
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Responsive menu styles
function handleResponsiveMenu() {
    if (window.innerWidth > 768) {
        if (navLinks) navLinks.style.display = 'flex';
        if (hamburger) hamburger.classList.remove('active');
    } else {
        if (navLinks) navLinks.style.display = 'none';
    }
}

window.addEventListener('resize', handleResponsiveMenu);
handleResponsiveMenu();

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';
