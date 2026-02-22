"use client";

import { useState, useEffect, useCallback } from "react";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CheckoutForm({ cartItems, cartTotal, onSuccess, onClose }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+380",
    email: "",
    comment: "",
    paymentMethod: "cash_on_delivery",
    shippingMethod: "nova_poshta",
  });
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showCities, setShowCities] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const debouncedCity = useDebounce(cityQuery, 300);
  const debouncedWarehouse = useDebounce(warehouseQuery, 300);

  useEffect(() => {
    if (debouncedCity.length < 2) {
      setCities([]);
      return;
    }
    fetch(`/api/novaposhta/cities?q=${encodeURIComponent(debouncedCity)}`)
      .then((r) => r.json())
      .then((d) => setCities(d.data || []))
      .catch(() => setCities([]));
  }, [debouncedCity]);

  useEffect(() => {
    if (!selectedCity) {
      setWarehouses([]);
      return;
    }
    const q = debouncedWarehouse ? `&q=${encodeURIComponent(debouncedWarehouse)}` : "";
    fetch(`/api/novaposhta/warehouses?cityRef=${selectedCity.ref}${q}`)
      .then((r) => r.json())
      .then((d) => setWarehouses(d.data || []))
      .catch(() => setWarehouses([]));
  }, [selectedCity, debouncedWarehouse]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9+]/g, "");
    if (!val.startsWith("+380")) val = "+380";
    if (val.length > 13) val = val.slice(0, 13);
    setForm((prev) => ({ ...prev, phone: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const orderData = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        comment: form.comment,
        paymentMethod: form.paymentMethod,
        shippingMethod: form.shippingMethod,
        products: cartItems.map((item) => ({
          id: item.id,
          prom_id: item.prom_id || "",
          name: item.name,
          price: item.price,
          quantity: item.qty || 1,
          sku: item.sku || "",
        })),
        novaPoshta:
          selectedCity && selectedWarehouse
            ? {
                serviceType: "WarehouseWarehouse",
                payer: "Recipient",
                city: selectedCity.ref,
                warehouse: selectedWarehouse.number ?? selectedWarehouse.description,
              }
            : null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        if (onSuccess) onSuccess(data);
      }
    } catch {
      setError("Помилка з'єднання. Перевірте інтернет та спробуйте знову.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-5xl mb-4">✅</div>
          <h3 className="font-display text-xl font-semibold text-losso-stone mb-2">Замовлення оформлено!</h3>
          <p className="text-losso-muted text-sm leading-relaxed mb-6">
            Дякуємо за замовлення! Наш менеджер зв'яжеться з вами найближчим часом для підтвердження.
          </p>
          <button type="button" onClick={onClose} className="rounded-xl bg-losso-sage text-white px-6 py-3 font-medium hover:bg-losso-sage-dark">
            Закрити
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full my-8 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-losso-sand px-6 py-4 flex justify-between items-center">
          <h2 className="font-display text-lg font-semibold text-losso-stone">Оформлення замовлення</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-losso-sand text-losso-muted text-2xl leading-none" aria-label="Закрити">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
          )}

          <div>
            <h4 className="text-xs font-bold text-losso-sage uppercase tracking-wider mb-3">Контактні дані</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-losso-stone mb-1">Ім'я *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Ваше ім'я" className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50 focus:border-losso-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-losso-stone mb-1">Прізвище</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Прізвище" className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-losso-stone mb-1">Телефон *</label>
                <input name="phone" value={form.phone} onChange={handlePhoneChange} required placeholder="+380XXXXXXXXX" className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-losso-stone mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-losso-sage uppercase tracking-wider mb-3">Доставка</h4>
            <div className="mb-3">
              <label className="block text-sm font-medium text-losso-stone mb-1">Спосіб доставки</label>
              <select name="shippingMethod" value={form.shippingMethod} onChange={handleChange} className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm bg-white">
                <option value="nova_poshta">Нова Пошта (відділення)</option>
                <option value="nova_poshta_courier">Нова Пошта (кур'єр)</option>
                <option value="ukrposhta">Укрпошта</option>
                <option value="pickup">Самовивіз (м. Бориспіль)</option>
              </select>
            </div>

            {form.shippingMethod.startsWith("nova_poshta") && (
              <>
                <div className="relative mb-3">
                  <label className="block text-sm font-medium text-losso-stone mb-1">Місто *</label>
                  <input
                    value={selectedCity ? selectedCity.name : cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setSelectedCity(null);
                      setSelectedWarehouse(null);
                      setShowCities(true);
                    }}
                    onFocus={() => setShowCities(true)}
                    placeholder="Почніть вводити назву міста..."
                    required
                    className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50"
                  />
                  {showCities && cities.length > 0 && !selectedCity && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-losso-sand rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {cities.map((c) => (
                        <button
                          key={c.ref}
                          type="button"
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-losso-cream border-b border-losso-sand/50 last:border-0"
                          onClick={() => {
                            setSelectedCity(c);
                            setCityQuery(c.name);
                            setShowCities(false);
                            setSelectedWarehouse(null);
                            setWarehouseQuery("");
                          }}
                        >
                          {c.name}
                          {c.area ? `, ${c.area}` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCity && form.shippingMethod === "nova_poshta" && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-losso-stone mb-1">Відділення *</label>
                    <input
                      value={selectedWarehouse ? (selectedWarehouse.description || selectedWarehouse.number) : warehouseQuery}
                      onChange={(e) => {
                        setWarehouseQuery(e.target.value);
                        setSelectedWarehouse(null);
                        setShowWarehouses(true);
                      }}
                      onFocus={() => setShowWarehouses(true)}
                      placeholder="Номер або адреса відділення..."
                      required
                      className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50"
                    />
                    {showWarehouses && warehouses.length > 0 && !selectedWarehouse && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-losso-sand rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                        {warehouses.map((w) => (
                          <button
                            key={w.ref}
                            type="button"
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-losso-cream border-b border-losso-sand/50 last:border-0"
                            onClick={() => {
                              setSelectedWarehouse(w);
                              setWarehouseQuery(w.description || w.number);
                              setShowWarehouses(false);
                            }}
                          >
                            {w.description || w.number}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-losso-sage uppercase tracking-wider mb-3">Оплата</h4>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm bg-white">
              <option value="cash_on_delivery">Накладний платіж (при отриманні)</option>
              <option value="card_on_delivery">Оплата карткою при отриманні</option>
              <option value="card_online">Оплата карткою онлайн</option>
              <option value="bank_transfer">Безготівковий розрахунок (для юр. осіб)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-losso-stone mb-1">Коментар до замовлення</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Додаткові побажання..." rows={3} className="w-full rounded-lg border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50 resize-y" />
          </div>

          <div className="rounded-xl bg-losso-cream p-4">
            <h4 className="text-sm font-semibold text-losso-stone mb-2">Ваше замовлення:</h4>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span className="text-losso-muted">{item.name} × {item.qty || 1}</span>
                <span className="font-medium">{item.price * (item.qty || 1)} ₴</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 mt-2 border-t border-losso-sand">
              <span>Разом:</span>
              <span className="text-losso-sage">{cartTotal} ₴</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-losso-sage text-white py-3.5 font-semibold hover:bg-losso-sage-dark disabled:opacity-60 transition-colors">
            {loading ? "Оформлення..." : `Оформити замовлення — ${cartTotal} ₴`}
          </button>
          <p className="text-center text-xs text-losso-muted">Натискаючи кнопку, ви погоджуєтесь з умовами публічної оферти</p>
        </form>
      </div>
    </div>
  );
}
