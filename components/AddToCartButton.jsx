"use client";

export default function AddToCartButton({ productId, productName, price, className = "", prom_id, sku }) {
  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("losso-cart") || "[]");
    const existing = cart.find((i) => i.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: productId, name: productName, price, qty: 1, prom_id: prom_id ?? "", sku: sku ?? "" });
    }
    localStorage.setItem("losso-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    alert("Додано в кошик");
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      className={className || "rounded-lg bg-stone-800 text-white px-6 py-3 font-medium hover:bg-stone-700"}
    >
      Додати в кошик
    </button>
  );
}
