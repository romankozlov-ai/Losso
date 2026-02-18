import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-stone-800 hover:text-stone-600">
          LOSSO
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-stone-600 hover:text-stone-900"
          >
            Головна
          </Link>
          <Link
            href="/catalog"
            className="text-stone-600 hover:text-stone-900"
          >
            Каталог
          </Link>
          <Link
            href="/delivery"
            className="text-stone-600 hover:text-stone-900"
          >
            Доставка та оплата
          </Link>
          <Link
            href="/contacts"
            className="text-stone-600 hover:text-stone-900"
          >
            Контакти
          </Link>
          <Link
            href="/cart"
            className="rounded-lg bg-stone-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-stone-700"
          >
            Кошик
          </Link>
        </nav>
      </div>
    </header>
  );
}
