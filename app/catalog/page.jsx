import Link from "next/link";
import { mainCategories, homeSubcategories } from "@/data/categories";
import { products } from "@/data/products";

export const metadata = {
  title: "Каталог — LOSSO",
  description: "Каталог товарів для дому та саду LOSSO. Годинники, кухня, нічники, сад, інструменти.",
};

export default function CatalogPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Каталог</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">Основні категорії</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="block rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-400 hover:shadow-md"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">Товари для дому</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {homeSubcategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="rounded-lg bg-stone-100 px-4 py-2 text-stone-700 hover:bg-stone-200"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-700 mb-4">Усі товари</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="block rounded-xl border border-stone-200 bg-white p-4 hover:shadow-lg"
            >
              <div className="aspect-square bg-stone-100 rounded-lg mb-3 flex items-center justify-center text-stone-400 text-sm">
                Фото
              </div>
              <h3 className="font-medium text-stone-800 line-clamp-2 mb-2">{p.name}</h3>
              <p className="text-stone-600 font-semibold">{p.price} ₴</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
