"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог" },
  { href: "/delivery", label: "Доставка та оплата" },
  { href: "/contacts", label: "Контакти" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-bold text-stone-800 hover:text-stone-600 min-h-[44px] min-w-[44px] flex items-center"
          aria-label="LOSSO — на головну"
        >
          LOSSO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-lg hover:bg-stone-100 min-h-[44px] flex items-center"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="rounded-lg bg-stone-800 text-white px-4 py-2.5 text-sm font-medium hover:bg-stone-700 min-h-[44px] flex items-center"
          >
            Кошик
          </Link>
        </nav>

        {/* Mobile: menu button + cart */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/cart"
            className="rounded-lg bg-stone-800 text-white px-3 py-2.5 text-sm font-medium hover:bg-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Кошик"
          >
            Кошик
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          >
            <span className="sr-only">{menuOpen ? "Закрити" : "Меню"}</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          className="md:hidden border-t border-stone-200 bg-white"
          aria-label="Головне меню"
        >
          <ul className="max-w-6xl mx-auto px-4 py-2">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 px-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg min-h-[48px] flex items-center"
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
