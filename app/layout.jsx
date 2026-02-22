import "./globals.css";
import { Lora, Manrope } from "next/font/google";
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
  title: "LOSSO — товари для дому та саду",
  description:
    "Інтернет-магазин LOSSO: товари для дому, саду, кухні, будівельні інструменти. Оптом та в роздріб. Доставка по Україні.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className={`scroll-smooth ${lora.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-losso-cream text-losso-stone antialiased overflow-x-hidden">
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
