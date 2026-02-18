import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Каталог — LOSSO" };
  return {
    title: `${category.name} — LOSSO`,
    description: `Купити ${category.name.toLowerCase()} в інтернет-магазині LOSSO. Доставка по Україні.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-stone-500 mb-4">
        <Link href="/" className="hover:text-stone-700">Головна</Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-stone-700">Каталог</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{category.name}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">{category.name}</h1>

      {items.length === 0 ? (
        <p className="text-stone-600">У цій категорії поки немає товарів.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block rounded-xl border border-stone-200 bg-white p-4 hover:shadow-lg"
            >
              <div className="aspect-square bg-stone-100 rounded-lg mb-3 flex items-center justify-center text-stone-400 text-sm">
                Фото
              </div>
              <h2 className="font-medium text-stone-800 line-clamp-2 mb-2">{product.name}</h2>
              <p className="text-stone-600 font-semibold">{product.price} ₴</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
