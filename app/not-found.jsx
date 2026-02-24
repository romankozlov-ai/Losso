import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-6xl font-bold text-green-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Сторінку не знайдено</p>
        <Link
          href="/"
          className="px-6 py-3 bg-green-800 text-white rounded-full font-medium hover:bg-green-900 transition-colors"
        >
          На головну
        </Link>
      </div>
    </div>
  );
}

