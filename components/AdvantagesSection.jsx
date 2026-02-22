"use client";

import { Truck, CreditCard, Shield, RefreshCw } from "lucide-react";
import FadeIn from "./FadeIn";
import { advantages } from "@/data/advantages";

const icons = { truck: Truck, creditCard: CreditCard, shield: Shield, refresh: RefreshCw };

export default function AdvantagesSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {advantages.map((a, i) => (
          <FadeIn key={a.title} delay={i * 0.1}>
            <div className="bg-white rounded-2xl p-6 sm:p-7 text-center border border-losso-sand shadow-md hover:shadow-lg hover:border-losso-sage-light/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-losso-sage-light text-losso-sage flex items-center justify-center mx-auto mb-3">
                {(() => {
                  const Icon = icons[a.icon] || Truck;
                  return <Icon className="w-7 h-7" />;
                })()}
              </div>
              <h3 className="font-semibold text-losso-stone mb-1">{a.title}</h3>
              <p className="text-sm text-losso-muted">{a.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
