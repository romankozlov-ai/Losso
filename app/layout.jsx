import "./globals.css";
import { Lora, Manrope } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ScrollToTop from "@/components/ScrollToTop";
import { WishlistProvider } from "@/context/WishlistContext";

const lora = Lora({
  subsets: ["latin", "cyrillic"],
  variable: "--font-lora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://losso-lemon.vercel.app"),
  title: {
    default: "LOSSO — інтернет-магазин товарів для дому та саду",
    template: "%s | LOSSO",
  },
  description:
    "Магазин LOSSO — годинники, нічники, ваги, товари для кухні та саду. Оптом і в роздріб. Доставка по всій Україні.",
  keywords: [
    "LOSSO",
    "товари для дому",
    "товари для саду",
    "інтернет-магазин",
    "Україна",
    "годинники",
    "нічники",
    "караоке мікрофони",
  ],
  authors: [{ name: "LOSSО" }],
  openGraph: {
    title: "LOSSO — інтернет-магазин товарів для дому та саду",
    description:
      "Годинники, нічники, ваги, товари для кухні та саду. Оптом і в роздріб. Доставка по Україні.",
    url: "https://losso-lemon.vercel.app",
    siteName: "LOSSO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LOSSO — товари для дому та саду",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOSSO — інтернет-магазин товарів для дому та саду",
    description: "Годинники, нічники, ваги, товари для кухні та саду.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://losso-lemon.vercel.app" },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="uk"
      className={`scroll-smooth ${lora.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-losso-cream text-losso-stone antialiased overflow-x-hidden">
        {/* Google Tag Manager */}
        <Script
          id="gtm-losso"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `,
          }}
        />

        <WishlistProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
          <ScrollToTop />
        </WishlistProvider>
      </body>
    </html>
  );
}


