"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const h = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-losso-sage text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-losso-sage-dark hover:-translate-y-0.5 ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
      aria-label="Вгору"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}
