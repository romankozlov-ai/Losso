export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/cart", "/_next/"],
      },
    ],
    sitemap: "https://losso-lemon.vercel.app/sitemap.xml",
  };
}

