import { mainCategories } from "@/data/categories";
import { products } from "@/data/products";
import CatalogClient from "@/components/CatalogClient";

export const metadata = {
  title: "Каталог — LOSSO",
  description: "Каталог товарів для дому та саду LOSSO. Годинники, кухня, нічники, сад, інструменти.",
};

export default function CatalogPage() {
  return (
    <div>
      <h1 className="max-w-6xl mx-auto px-4 pt-6 text-2xl font-bold text-losso-stone">Каталог</h1>
      <CatalogClient products={products} mainCategories={mainCategories} />
    </div>
  );
}
