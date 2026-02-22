"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProductById } from "@/data/products";
import CheckoutForm from "@/components/CheckoutForm";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("losso-cart") : null;
    setCart(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem("losso-cart");
      setCart(raw ? JSON.parse(raw) : []);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cartItems = cart.map((item) => {
    const product = getProductById(item.id);
    return {
      ...item,
      prom_id: item.prom_id ?? product?.prom_id ?? "",
      sku: item.sku ?? product?.sku ?? "",
    };
  });
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

  const remove = (id) => {
    const next = cart.filter((i) => i.id !== id);
    localStorage.setItem("losso-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQty = (id, delta) => {
    const next = cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, (i.qty || 1) + delta) } : i));
    localStorage.setItem("losso-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-losso-stone mb-6">Кошик</h1>
        <p className="text-losso-muted mb-4">Кошик порожній. Додайте товари з каталогу.</p>
        <Link href="/catalog" className="inline-flex items-center justify-center rounded-xl bg-losso-sage text-white px-6 py-3 font-medium hover:bg-losso-sage-dark min-h-[48px]">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-losso-stone mb-6">Кошик</h1>
      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-losso-sand bg-white">
            <div className="w-16 h-16 rounded-lg bg-losso-sand/50 shrink-0 flex items-center justify-center text-losso-muted text-xs">Фото</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-losso-stone truncate">{item.name}</p>
              <p className="text-sm text-losso-sage font-semibold">{item.price} ₴</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full border border-losso-sand flex items-center justify-center hover:bg-losso-sand text-lg leading-none">−</button>
              <span className="w-8 text-center font-medium">{item.qty || 1}</span>
              <button type="button" onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full border border-losso-sand flex items-center justify-center hover:bg-losso-sand text-lg leading-none">+</button>
            </div>
            <p className="font-semibold text-losso-stone w-20 text-right">{item.price * (item.qty || 1)} ₴</p>
            <button type="button" onClick={() => remove(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-losso-muted hover:text-red-600" aria-label="Видалити">✕</button>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-lg font-semibold text-losso-stone">Разом: <span className="text-losso-sage">{cartTotal} ₴</span></p>
        <div className="flex gap-3">
          <Link href="/catalog" className="rounded-xl border border-losso-sand px-6 py-3 font-medium text-losso-stone hover:bg-losso-sand">
            Продовжити покупки
          </Link>
          <button type="button" onClick={() => setCheckoutOpen(true)} className="rounded-xl bg-losso-sage text-white px-6 py-3 font-semibold hover:bg-losso-sage-dark">
            Оформити замовлення
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutForm
          cartItems={cartItems}
          cartTotal={cartTotal}
          onSuccess={() => {
            setCheckoutOpen(false);
            localStorage.setItem("losso-cart", "[]");
            window.dispatchEvent(new Event("storage"));
          }}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
