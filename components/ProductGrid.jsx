"use client";

import ProductCard from "./ProductCard";
import FadeIn from "./FadeIn";

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p, i) => (
        <FadeIn key={p.id} delay={i * 0.07}>
          <ProductCard product={p} delay={i * 50} />
        </FadeIn>
      ))}
    </div>
  );
}
