export const metadata = {
  title: "Доставка та оплата — LOSSO",
  description: "Умови доставки та оплати в інтернет-магазині LOSSO. Доставка по Україні.",
};

export default function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Доставка та оплата</h1>
      <div className="prose prose-stone max-w-none space-y-6 text-stone-700">
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Доставка</h2>
          <p>
            Доставка по всій Україні. Терміни та вартість залежать від перевізника та регіону.
            Можливий самовивіз у м. Київ (за домовленістю).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Оплата</h2>
          <p>
            Оплата при отриманні (готівка або карткою), або передоплата на карту — за домовленістю.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Повернення та обмін</h2>
          <p>
            Згідно з чинним законодавством України. Деталі уточнюйте у відділі продажу.
          </p>
        </section>
      </div>
      <p className="mt-8 text-stone-600">
        Питання щодо доставки та оплати:{" "}
        <a href="mailto:lossotrade@gmail.com" className="text-stone-800 hover:underline">
          lossotrade@gmail.com
        </a>
        , +380 (98) 040-25-00.
      </p>
    </div>
  );
}
