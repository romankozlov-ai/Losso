"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог" },
  { href: "/delivery", label: "Доставка та оплата" },
  { href: "/contacts", label: "Контакти" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-losso-sand/80 bg-losso-cream/95 backdrop-blur-sm">
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
          <Link
            href="/cart"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-losso-sage text-white px-4 py-2.5 text-sm font-medium hover:bg-losso-sage-dark transition-colors min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden />
            Кошик
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/cart"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-losso-sage text-white hover:bg-losso-sage-dark transition-colors"
            aria-label="Кошик"
          >
            <ShoppingBag className="w-5 h-5" />
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
  );
}
