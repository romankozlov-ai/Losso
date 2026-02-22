"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "losso-wishlist";

const WishlistContext = createContext({ wishlist: [], toggleWishlist: () => {}, hasInWishlist: () => false });

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const setIdsAndSave = useCallback((next) => {
    setIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
  }, []);

  const toggle = useCallback((id) => {
    setIdsAndSave((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, [setIdsAndSave]);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return (
    <WishlistContext.Provider value={{ wishlist: ids, toggleWishlist: toggle, hasInWishlist: has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx || !ctx.toggleWishlist) {
    return { wishlist: [], toggleWishlist: () => {}, hasInWishlist: () => false };
  }
  return ctx;
}
