import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { mainCategories, homeSubcategories } from "@/data/categories";
import { products } from "@/data/products";
import FadeIn from "@/components/FadeIn";
import ProductGrid from "@/components/ProductGrid";
import AdvantagesSection from "@/components/AdvantagesSection";
import ReviewsSection from "@/components/ReviewsSection";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Торгова компанія LOSSO",
  url: "https://losso-lemon.vercel.app",
  logo: "https://losso-lemon.vercel.app/icon-512.png",
  description: "Інтернет-магазин товарів для дому та саду",
  address: {
    "@type": "PostalAddress",
    streetAddress: "вул. Новопрорізна 4",
    addressLocality: "Бориспіль",
    addressRegion: "Київська область",
    addressCountry: "UA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+380980402500",
    contactType: "sales",
    availableLanguage: ["Ukrainian"],
    areaServed: "UA",
  },
};

export default function HomePage() {
  const featuredProducts = products.slice(0, 8);

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Hero — Warm editorial */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex flex-col justify-center px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-losso-sand via-losso-cream to-losso-sage-light/30"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(22,101,52,0.08),transparent)]" aria-hidden />
        <div className="relative max-w-6xl mx-auto w-full text-center pt-12 pb-20 md:pt-16 md:pb-28">
          <FadeIn>
            <p className="font-sans text-sm font-medium tracking-wide text-losso-sage uppercase mb-4 md:mb-6">
              Товари для дому та саду
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-losso-stone tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6 md:mb-8">
              Магазин LOSSO — якість і затишок у вашому домі
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-sans text-lg sm:text-xl text-losso-muted max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
              Годинники, нічники, ваги, товари для кухні та саду. Оптом і в
              роздріб. Доставка по всій Україні.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full bg-losso-sage text-white px-8 py-4 text-base font-medium hover:bg-losso-sage-dark transition-all hover:gap-3 min-h-[52px]"
            >
              Перейти в каталог
              <ChevronRight className="w-5 h-5 shrink-0" aria-hidden />
            </Link>
          </FadeIn>
        </div>
      </section>

      <AdvantagesSection />

      {/* Категорії */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-losso-stone mb-4 sm:mb-6">
            Категорії
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="block rounded-2xl border border-losso-sand bg-losso-cream p-5 hover:border-losso-sage/40 hover:shadow-md hover:shadow-losso-sage/5 transition-all"
              >
                <span className="font-medium text-losso-stone">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Товари для дому — підкатегорії */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 bg-losso-cream">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-losso-stone mb-4 sm:mb-6">
            Товари для дому
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {homeSubcategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="rounded-full bg-white border border-losso-sand px-4 py-2.5 text-losso-stone hover:border-losso-sage/40 hover:text-losso-sage font-medium min-h-[44px] inline-flex items-center transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Популярні товари */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-losso-stone mb-4 sm:mb-6">
              Популярні товари
            </h2>
          </FadeIn>
          <ProductGrid products={featuredProducts} />
          <div className="mt-6 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-losso-sage font-medium hover:text-losso-sage-dark"
            >
              Всі товари
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* Про нас + контакти */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 bg-losso-sand">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-losso-stone mb-4">
              Про нас
            </h2>
            <p className="text-losso-muted leading-relaxed">
              Інтернет-магазин товарів для дому та саду Losso пропонує
              оригінальну продукцію за привабливою ціною. Широкий асортимент,
              доставка по Україні, зручна оплата та обмін згідно з
              законодавством.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-losso-stone mb-4">
              Контакти
            </h2>
            <ul className="space-y-2 text-losso-muted">
              <li>+380 (98) 040-25-00</li>
              <li>+380 (93) 040-25-00</li>
              <li>
                <a
                  href="mailto:lossotrade@gmail.com"
                  className="hover:text-losso-sage transition-colors"
                >
                  lossotrade@gmail.com
                </a>
              </li>
              <li>м. Бориспіль, вул. Новопрорізна 4</li>
            </ul>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-1 mt-4 text-losso-sage font-medium hover:text-losso-sage-dark"
            >
              Написати нам
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
