"use client";

import FadeIn from "./FadeIn";
import { reviews } from "@/data/reviews";

function Stars({ rating }) {
  const r = Number(rating) || 0;
  return (
    <span className="inline-flex text-amber-500" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? "text-amber-500" : "text-stone-300"}>★</span>
      ))}
    </span>
  );
}

export default function ReviewsSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-losso-stone mb-2">Відгуки покупців</h2>
          <p className="text-losso-muted mb-8">Що кажуть наші клієнти</p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((r, i) => (
            <FadeIn key={r.name + r.date} delay={i * 0.1}>
              <div className="bg-losso-cream rounded-2xl p-6 border border-losso-sand/60 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-losso-stone">{r.name}</div>
                    <div className="text-xs text-losso-muted">{r.city}</div>
                  </div>
                  <div className="text-right">
                    <Stars rating={r.rating} />
                    <div className="text-xs text-losso-muted mt-1">{r.date}</div>
                  </div>
                </div>
                <p className="text-sm text-losso-stone leading-relaxed">{r.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
