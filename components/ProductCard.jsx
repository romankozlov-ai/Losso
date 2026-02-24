"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import AddToCartButton from "./AddToCartButton";
import { useState } from "react";

const BADGE_CLASS = {
  Хіт: "bg-losso-sage text-white",
  Новинка: "bg-amber-500 text-white",
  Акція: "bg-red-600 text-white",
};

function Stars({ rating }) {
  const r = Number(rating) || 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= full
              ? "text-amber-500"
              : half && i === full + 1
              ? "text-amber-500 opacity-80"
              : "text-stone-300"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductCard({ product, delay = 0 }) {
  const { hasInWishlist, toggleWishlist } = useWishlist();
  const [quickView, setQuickView] = useState(false);
  const inWishlist = hasInWishlist(product.id);
  const badge =
    product.badge && BADGE_CLASS[product.badge] ? product.badge : null;

  return (
    <>
      <div
        className="group relative rounded-2xl border border-losso-sand bg-white overflow-hidden transition-all duration-300 hover:border-stone-300 hover:shadow-lg hover:shadow-losso-sage/5 hover:-translate-y-1"
        style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      >
        <div className="relative aspect-square bg-losso-sand/50 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-losso-muted text-sm">
              Фото
            </div>
          )}

          {badge && (
            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${BADGE_CLASS[badge]}`}
            >
              {badge}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
              inWishlist
                ? "text-red-500 bg-white/95"
                : "text-stone-400 bg-white/90 hover:text-red-500 hover:scale-110"
            }`}
            aria-label={
              inWishlist ? "Прибрати з обраного" : "Додати в обране"
            }
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 opacity-0 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 bg-gradient-to-t from-black/20 to-transparent">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              prom_id={product.prom_id}
              sku={product.sku}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-losso-sage text-white py-2.5 text-sm font-semibold hover:bg-losso-sage-dark transition-colors border-0"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setQuickView(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/95 text-losso-stone py-2.5 text-sm font-semibold hover:bg-white transition-colors"
            >
              <Eye className="w-4 h-4" /> Огляд
            </button>
          </div>
        </div>

        <div className="p-4">
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-medium text-losso-stone line-clamp-2 mb-2 hover:text-losso-sage transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.rating != null && (
            <div className="flex items-center gap-2 mb-2 text-sm text-losso-muted">
              <Stars rating={product.rating} />
              <span>{product.rating}</span>
              {product.reviews != null && <span>({product.reviews})</span>}
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-losso-stone">
              {product.price} ₴
            </span>
            {product.oldPrice != null && (
              <span className="text-sm text-losso-muted line-through">
                {product.oldPrice} ₴
              </span>
            )}
          </div>
        </div>
      </div>

      {quickView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setQuickView(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setQuickView(false)}
                className="p-2 rounded-full hover:bg-losso-sand"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>
            <div className="px-4 pb-4">
              {badge && (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${BADGE_CLASS[badge]}`}
                >
                  {badge}
                </span>
              )}
              <h3 className="font-semibold text-lg text-losso-stone mb-2">
                {product.name}
              </h3>
              {product.rating != null && (
                <div className="flex items-center gap-2 mb-2 text-sm text-losso-muted">
                  <Stars rating={product.rating} />
                  <span>{product.rating}</span>
                  {product.reviews != null && (
                    <span>({product.reviews} відгуків)</span>
                  )}
                </div>
              )}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl font-bold text-losso-stone">
                  {product.price} ₴
                </span>
                {product.oldPrice != null && (
                  <span className="text-sm text-losso-muted line-through">
                    {product.oldPrice} ₴
                  </span>
                )}
              </div>
              <p className="text-sm text-losso-muted mb-4">
                Оригінальна продукція LOSSO. Гарантія якості. Доставка по всій
                Україні.
              </p>
              <div className="flex gap-2">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  prom_id={product.prom_id}
                  sku={product.sku}
                  className="flex-1 rounded-lg bg-losso-sage text-white px-4 py-3 font-medium hover:bg-losso-sage-dark"
                />
                <Link
                  href={`/product/${product.id}`}
                  className="rounded-lg border border-losso-sand px-4 py-3 font-medium hover:bg-losso-sand"
                >
                  Детальніше
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

