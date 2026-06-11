/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cho phép next/image tối ưu ảnh tải lên (Vercel Blob) và ảnh từ link ngoài
    // mà admin có thể dán vào. Ảnh cùng domain (/uploads, /logo.png) luôn được hỗ trợ.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};
export default nextConfig;
