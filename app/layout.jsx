import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "LOSSO — товари для дому та саду",
  description:
    "Інтернет-магазин LOSSO: товари для дому, саду, кухні, будівельні інструменти. Оптом та в роздріб. Доставка по Україні.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
