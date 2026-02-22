"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ProductGrid from "./ProductGrid";
import { homeSubcategories } from "@/data/categories";

const SORT_OPTIONS = [
  { value: "popular", label: "За популярністю" },
  { value: "price-asc", label: "Від дешевих" },
  { value: "price-desc", label: "Від дорогих" },
  { value: "rating", label: "За рейтингом" },
  { value: "new", label: "Новинки" },
];

export default function CatalogClient({ products, mainCategories }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = activeCategory === "all" ? products : products.filter((p) => p.categorySlug === activeCategory);
    return [...list].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "new") return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
      return (b.reviews ?? 0) - (a.reviews ?? 0);
    });
  }, [products, activeCategory, sortBy]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Сортування";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-losso-stone mb-3">Основні категорії</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog/${cat.slug}`}
              className="block rounded-xl border border-losso-sand bg-white p-5 hover:border-losso-sage/40 hover:shadow-md transition-all"
            >
              {cat.emoji && <span className="mr-2">{cat.emoji}</span>}
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-losso-stone mb-3">Товари для дому</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${activeCategory === "all" ? "bg-losso-sage text-white" : "bg-losso-sand text-losso-stone hover:border-losso-sage/40 hover:text-losso-sage border border-transparent"}`}
          >
            Всі
          </button>
          {homeSubcategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] border ${activeCategory === cat.slug ? "border-losso-sage bg-losso-sage-light text-losso-sage" : "border-losso-sand bg-white text-losso-stone hover:border-losso-sage/40 hover:text-losso-sage"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-losso-stone">Усі товари</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-losso-sand bg-white px-4 py-2.5 text-sm font-medium text-losso-stone hover:border-losso-sage/40 min-h-[44px]"
            >
              {sortLabel}
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} aria-hidden />
                <div className="absolute top-full right-0 mt-1 z-50 min-w-[180px] bg-white rounded-lg border border-losso-sand shadow-lg overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-losso-cream transition-colors ${sortBy === opt.value ? "text-losso-sage font-semibold" : "text-losso-stone"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-losso-muted py-8">У цій категорії поки немає товарів.</p>
        ) : (
          <ProductGrid products={filtered} />
        )}
      </section>
    </div>
  );
}
