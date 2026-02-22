"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { products } from "@/data/products";
import SearchOverlay from "./SearchOverlay";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог" },
  { href: "/delivery", label: "Доставка та оплата" },
  { href: "/contacts", label: "Контакти" },
];

function getCartCount() {
  if (typeof window === "undefined") return 0;
  try {
    const cart = JSON.parse(localStorage.getItem("losso-cart") || "[]");
    return cart.reduce((s, i) => s + (i.qty || 1), 0);
  } catch { return 0; }
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} products={products} />
      <header className={`sticky top-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md ${scrolled ? "border-b border-losso-sand shadow-sm" : "border-b border-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-18">
        <Link
          href="/"
          className="font-display text-xl md:text-2xl font-semibold text-losso-stone tracking-tight hover:text-losso-sage transition-colors min-h-[44px] flex items-center"
          aria-label="LOSSO — на головну"
        >
          LOSSO
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-losso-muted hover:text-losso-stone px-4 py-2 rounded-lg hover:bg-losso-sand/60 transition-colors min-h-[44px] flex items-center text-sm font-medium"
            >
              {label}
            </Link>
          ))}
          <button type="button" onClick={() => setSearchOpen(true)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-losso-stone hover:bg-losso-sand/60 transition-colors" aria-label="Пошук">
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/cart"
            className="ml-1 relative inline-flex items-center gap-2 rounded-full bg-losso-sage text-white px-4 py-2.5 text-sm font-medium hover:bg-losso-sage-dark transition-colors min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden />
            Кошик
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center px-1">{cartCount}</span>}
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <button type="button" onClick={() => setSearchOpen(true)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-losso-stone hover:bg-losso-sand/60" aria-label="Пошук">
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/cart"
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-losso-sage text-white hover:bg-losso-sage-dark transition-colors"
            aria-label="Кошик"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-losso-sage text-white hover:bg-losso-sage-dark transition-colors"
            aria-label="Кошик"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute top-0 right-0 min-w-[16px] h-[16px] rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-losso-stone hover:bg-losso-sand/60 transition-colors"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="md:hidden border-t border-losso-sand bg-losso-cream"
          aria-label="Головне меню"
        >
          <ul className="max-w-6xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 px-3 text-losso-stone hover:text-losso-sage hover:bg-losso-sand/50 rounded-lg font-medium transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
    </>
  );
}
