import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ESL Academy — English as a Second Language",
    short_name: "ESL Academy",
    description: "Trung tâm tiếng Anh cho bé 3–15 tuổi. Đăng ký học thử miễn phí.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#80b848",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
