import Link from "next/link";
import { mainCategories, homeSubcategories } from "@/data/categories";
import { products } from "@/data/products";

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-800 text-white py-10 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Магазин LOSSO — товари для дому та саду
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
            Якісні товари для дому, кухні, саду та городу. Оптом і в роздріб. Доставка по всій Україні.
          </p>
          <Link
            href="/catalog"
            className="inline-block rounded-lg bg-white text-stone-800 px-6 py-3 font-medium hover:bg-stone-100 min-h-[48px] flex items-center justify-center"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Категорії */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Категорії</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="block rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-400 hover:shadow-md transition"
              >
                <span className="font-medium text-stone-800">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Товари для дому — підкатегорії */}
      <section className="py-8 sm:py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Товари для дому</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {homeSubcategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="rounded-lg bg-stone-100 px-4 py-2.5 text-stone-700 hover:bg-stone-200 min-h-[44px] inline-flex items-center"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Акційні / рекомендовані товари */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Популярні товари</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 hover:shadow-lg transition"
              >
                <div className="aspect-square bg-stone-100 rounded-lg mb-3 flex items-center justify-center text-stone-400 text-sm">
                  Фото
                </div>
                <h3 className="font-medium text-stone-800 line-clamp-2 mb-2">{p.name}</h3>
                <p className="text-stone-600 font-semibold">{p.price} ₴</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/catalog" className="text-stone-600 hover:text-stone-900 font-medium">
              Всі товари →
            </Link>
          </div>
        </div>
      </section>

      {/* Про нас + контакти */}
      <section className="py-8 sm:py-12 px-4 bg-stone-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Про нас</h2>
            <p className="text-stone-700">
              Інтернет-магазин товарів для дому та саду Losso пропонує оригінальну продукцію за привабливою ціною.
              Широкий асортимент, доставка по Україні, зручна оплата та обмін згідно з законодавством.
            </p>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Контакти</h2>
            <ul className="space-y-2 text-stone-700">
              <li>+380 (98) 040-25-00</li>
              <li>+380 (93) 040-25-00</li>
              <li>
                <a href="mailto:lossotrade@gmail.com" className="hover:underline">
                  lossotrade@gmail.com
                </a>
              </li>
              <li>м. Бориспіль, вул. Новопрорізна 4</li>
            </ul>
            <Link
              href="/contacts"
              className="inline-block mt-4 text-stone-800 font-medium hover:underline"
            >
              Написати нам →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
