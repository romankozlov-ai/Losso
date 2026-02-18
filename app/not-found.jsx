import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Сторінку не знайдено</h1>
      <p className="text-stone-600 mb-6">Такої сторінки немає на сайті.</p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-stone-800 text-white px-4 py-2 font-medium hover:bg-stone-700"
      >
        На головну
      </Link>
    </div>
  );
}
