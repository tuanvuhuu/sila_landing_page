import type { SiteContent } from "@/lib/content";

/**
 * Structured data (schema.org) cho Google → có thể hiển thị sao đánh giá,
 * địa chỉ, số điện thoại trong kết quả tìm kiếm.
 */
export default function JsonLd({ content, siteUrl }: { content: SiteContent; siteUrl: string }) {
  const abs = (url: string) => (url.startsWith("http") ? url : `${siteUrl}${url.startsWith("/") ? "" : "/"}${url}`);
  const ratings = content.testimonials.map((t) => t.rating).filter((n) => n > 0);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: content.centerName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: content.hero.image ? abs(content.hero.image) : `${siteUrl}/logo.png`,
    description: content.hero.subtitle,
    telephone: content.contact.phone,
    email: content.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: content.contact.address,
      addressCountry: "VN",
    },
    ...(content.contact.facebook ? { sameAs: [content.contact.facebook] } : {}),
    ...(ratings.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avg.toFixed(1),
            reviewCount: ratings.length,
            bestRating: 5,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
