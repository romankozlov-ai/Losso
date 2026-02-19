import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-3">Торгова компанія LOSSO</h3>
            <p className="text-sm">
              Товари для дому та саду. Оптом і в роздріб. Доставка по всій Україні.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Навігація</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/" className="block py-2 hover:text-white">Головна</Link>
              </li>
              <li>
                <Link href="/catalog" className="block py-2 hover:text-white">Каталог</Link>
              </li>
              <li>
                <Link href="/delivery" className="block py-2 hover:text-white">Доставка та оплата</Link>
              </li>
              <li>
                <Link href="/contacts" className="block py-2 hover:text-white">Контакти</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Контакти</h3>
            <ul className="space-y-1 text-sm">
              <li>+380 (98) 040-25-00</li>
              <li>+380 (93) 040-25-00</li>
              <li>+380 (50) 040-25-00</li>
              <li>
                <a href="mailto:lossotrade@gmail.com" className="hover:text-white">
                  lossotrade@gmail.com
                </a>
              </li>
              <li>м. Бориспіль, вул. Новопрорізна 4</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-stone-500 text-sm mt-8">
          © Торгова компанія LOSSO
        </p>
      </div>
    </footer>
  );
}
