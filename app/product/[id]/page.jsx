import Link from "next/link";
import { getProductById } from "@/data/products";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Товар — LOSSO" };
  return {
    title: `${product.name} — LOSSO`,
    description: `${product.name}. ${product.price} ₴. Купити в LOSSO, доставка по Україні.`,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-stone-700">Головна</Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-stone-700">Каталог</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
          Фото товару
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-stone-800 mb-4">{product.price} ₴</p>
          {product.inStock && (
            <p className="text-green-700 mb-4">Готово до відправки</p>
          )}
          <p className="text-stone-600 mb-6">
            Опис товару можна додати тут або підтягувати з даних.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center rounded-lg bg-stone-800 text-white px-6 py-3 font-medium hover:bg-stone-700 min-h-[48px]"
            >
              Додати в кошик
            </Link>
            {product.externalUrl && (
              <a
                href={product.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-700 hover:bg-stone-50 min-h-[48px]"
              >
                Купити на losso.com.ua
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
