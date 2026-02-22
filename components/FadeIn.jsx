"use client";

import { useState, useEffect, useRef } from "react";

const directions = {
  up: "translateY(32px)",
  down: "translateY(-32px)",
  left: "translateX(32px)",
  right: "translateX(-32px)",
  none: "none",
};

export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsInView(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, isInView];
}

export default function FadeIn({ children, delay = 0, className = "", direction = "up" }) {
  const [ref, isInView] = useInView();
  const transform = directions[direction] ?? directions.up;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : transform,
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
