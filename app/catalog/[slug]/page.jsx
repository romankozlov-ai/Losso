import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

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
  const parent = !category.isMain && category.parentSlug ? getCategoryBySlug(category.parentSlug) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-losso-muted mb-4 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-losso-sage">Головна</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-losso-sage">Каталог</Link>
        {parent && (
          <>
            <span>/</span>
            <Link href={`/catalog/${category.parentSlug}`} className="hover:text-losso-sage">{parent.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-losso-stone font-medium">{category.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-losso-stone mb-6">{category.name}</h1>

      {items.length === 0 ? (
        <p className="text-losso-muted py-8">У цій категорії поки немає товарів.</p>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
