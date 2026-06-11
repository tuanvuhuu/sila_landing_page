import type { Metadata, Viewport } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";
import FacebookPixel from "@/components/FacebookPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import UtmTracker from "@/components/UtmTracker";
import TikTokPixel from "@/components/TikTokPixel";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "ESL Academy";
const title = "ESL Academy — English as a Second Language";
const description = "Trung tâm tiếng Anh cho bé 3–15 tuổi. Đăng ký học thử miễn phí.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName,
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#80b848",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${quicksand.variable} ${nunito.variable}`}>
      <head>
        {/* Nếu trình duyệt tắt JS: hiện luôn các phần tử có hiệu ứng cuộn */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important;}`}</style>
        </noscript>
      </head>
      <body>
        <FacebookPixel />
        <GoogleAnalytics />
        <TikTokPixel />
        <UtmTracker />
        {children}
      </body>
    </html>
  );
}
