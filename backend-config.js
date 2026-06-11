/**
 * SILA Backend Configuration
 * Cấu hình cho server backend (Node.js/Express)
 */

module.exports = {
    // ===== Server Configuration =====
    server: {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        host: process.env.HOST || 'localhost',
    },

    // ===== Database Configuration =====
    database: {
        type: process.env.DATABASE_TYPE || 'mongodb',

        // MongoDB Settings
        mongodb: {
            uri: process.env.MONGODB_URI,
            database: process.env.MONGODB_DATABASE || 'sila_db',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                minPoolSize: 5,
                retryWrites: true,
                w: 'majority',
            },
        },

        // PostgreSQL Settings
        postgresql: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'sila_db',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        },

        // MySQL Settings
        mysql: {
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE || 'sila_db',
            connectionLimit: 10,
            waitForConnections: true,
            enableKeepAlive: true,
        },
    },

    // ===== JWT & Authentication =====
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpire: process.env.JWT_EXPIRE || '7d',
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '30d',
    },

    // ===== Email Configuration =====
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        senderEmail: process.env.SENDER_EMAIL,
        senderName: process.env.SENDER_NAME || 'SILA English Center',

        // SendGrid Alternative
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: process.env.SENDER_EMAIL,
            fromName: process.env.SENDER_NAME,
        },

        // Email Templates
        templates: {
            welcome: 'welcome.html',
            contactReply: 'contact-reply.html',
            passwordReset: 'password-reset.html',
            courseConfirmation: 'course-confirmation.html',
        },

        // SMTP Settings
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        },
    },

    // ===== API Configuration =====
    api: {
        corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.API_RATE_LIMIT) || 100,
        },
        timeout: 30000, // 30 seconds
        apiVersion: 'v1',
        baseUrl: process.env.VERCEL_URL || `http://localhost:${process.env.PORT || 5000}`,
    },

    // ===== File Upload Configuration =====
    upload: {
        provider: process.env.UPLOAD_PROVIDER || 'local', // 'local' or 's3'
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        uploadDir: process.env.UPLOAD_DIR || './uploads',

        // AWS S3
        s3: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'ap-southeast-1',
            bucket: process.env.AWS_S3_BUCKET || 'sila-uploads',
        },
    },

    // ===== Payment Gateway =====
    payment: {
        stripe: {
            publicKey: process.env.STRIPE_PUBLIC_KEY,
            secretKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            currency: 'usd',
        },
    },

    // ===== Third-party Services =====
    services: {
        // Google
        google: {
            analyticsId: process.env.GOOGLE_ANALYTICS_ID,
        },

        // Firebase
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
        },

        // Twilio (SMS)
        twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        },

        // Facebook
        facebook: {
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
        },
    },

    // ===== Logging & Monitoring =====
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        sentry: {
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 1.0,
        },
    },

    // ===== Feature Flags =====
    features: {
        enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
        enablePayment: process.env.ENABLE_PAYMENT === 'true',
        enableSmsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
        enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
    },

    // ===== Admin Credentials =====
    admin: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    },

    // ===== Deployment =====
    deployment: {
        env: process.env.VERCEL_ENV || process.env.NODE_ENV,
        url: process.env.VERCEL_URL,
        analyticId: process.env.VERCEL_ANALYTICS_ID,
        region: 'sin1', // Singapore
    },
};
