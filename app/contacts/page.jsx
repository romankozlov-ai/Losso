export const metadata = {
  title: "Контакти — LOSSO",
  description: "Контакти інтернет-магазину LOSSO. Телефон, email, адреса. Зв'яжіться з нами.",
};

export default function ContactsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Контакти</h1>

      <div className="space-y-6 text-stone-700 mb-10">
        <p><strong>Торгова компанія LOSSO</strong></p>
        <ul className="space-y-2">
          <li>+380 (98) 040-25-00</li>
          <li>+380 (93) 040-25-00</li>
          <li>+380 (50) 040-25-00</li>
          <li>
            <a href="mailto:lossotrade@gmail.com" className="text-stone-800 hover:underline">
              lossotrade@gmail.com
            </a>
          </li>
          <li>м. Бориспіль, вул. Новопрорізна 4 (склад)</li>
        </ul>
        <p className="text-sm text-stone-500">
          Графік роботи: Пн–Пт 09:00–18:00, Сб 10:00–17:00, Нд — вихідний.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Написати нам</h2>
        <form
          action="#"
          method="post"
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
              Ім'я
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">
              Повідомлення
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-stone-800 text-white px-6 py-2 font-medium hover:bg-stone-700"
          >
            Надіслати
          </button>
        </form>
        <p className="mt-3 text-sm text-stone-500">
          Пізніше можна підключити відправку на email або в Telegram.
        </p>
      </section>
    </div>
  );
}
