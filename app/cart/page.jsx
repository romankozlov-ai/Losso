import Link from "next/link";

export const metadata = {
  title: "Кошик — LOSSO",
  description: "Ваш кошик покупок в інтернет-магазині LOSSO.",
};

export default function CartPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Кошик</h1>
      <p className="text-stone-600">
        Кошик поки порожній. Додайте товари з каталогу.
      </p>
      <Link
        href="/catalog"
        className="inline-block mt-4 rounded-lg bg-stone-800 text-white px-4 py-2 font-medium hover:bg-stone-700"
      >
        Перейти в каталог
      </Link>
    </div>
  );
}
