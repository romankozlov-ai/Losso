import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-800 text-stone-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-3">Торгова компанія LOSSO</h3>
            <p className="text-sm text-stone-400">
              Товари для дому та саду. Оптом і в роздріб. Доставка по всій Україні.
            </p>
            <div className="flex gap-2 mt-4">
              <a href="https://t.me/lossotrade" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-losso-sage transition-colors" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </a>
              <a href="viber://chat?number=380980402500" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-losso-sage transition-colors" aria-label="Viber">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M11.4 0C9.473.028 5.34.396 3.076 2.504 1.34 4.24.58 6.857.436 10.128c-.14 3.27-.32 9.407 5.763 11.084h.004l-.005 2.54s-.037.977.607 1.174c.777.24 1.234-.5 1.98-1.3.407-.437.97-1.078 1.394-1.57 3.85.324 6.81-.417 7.15-.537.783-.277 5.213-.823 5.937-6.72.748-6.088-.354-9.935-2.32-11.67l-.002-.001c-.558-.578-2.787-2.196-7.31-2.394 0 0-.394-.027-.913-.027l.003-.001z" /></svg>
              </a>
            </div>
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
              <li>
                <Link href="/privacy-policy" className="block py-2 hover:text-white">Політика конфіденційності</Link>
              </li>
              <li>
                <Link href="/oferta" className="block py-2 hover:text-white">Публічна оферта</Link>
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
          © {new Date().getFullYear()} Торгова компанія LOSSO. Всі права захищено.
        </p>
      </div>
    </footer>
  );
}
