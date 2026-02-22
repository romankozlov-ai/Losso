"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

export default function SearchOverlay({ open, onClose, query, setQuery, products }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const q = (query || "").trim().toLowerCase();
  const filtered = q
    ? products.filter((p) => p.name.toLowerCase().includes(q))
    : [];
  const showResults = q.length > 0;

  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-[600px] mx-4 bg-white rounded-xl shadow-xl overflow-hidden transition-transform duration-300"
        style={{ transform: open ? "translate(-50%, 0)" : "translate(-50%, -16px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="w-5 h-5 text-losso-muted shrink-0" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Пошук товарів..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 outline-none text-losso-stone font-sans text-base bg-transparent"
          />
          <button
            type="button"
            onClick={() => { onClose(); setQuery(""); }}
            className="p-2 rounded-full hover:bg-losso-sand text-losso-muted"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {showResults && (
          <div className="border-t border-losso-sand px-4 py-3 max-h-64 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-losso-cream transition-colors"
                >
                  <div className="w-11 h-11 rounded-lg bg-losso-sand/50 flex items-center justify-center overflow-hidden shrink-0">
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <span className="text-losso-muted text-xs">Фото</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-losso-stone truncate">{p.name}</div>
                    <div className="text-sm font-semibold text-losso-sage">{p.price} ₴</div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-3 text-sm text-losso-muted">Нічого не знайдено</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
