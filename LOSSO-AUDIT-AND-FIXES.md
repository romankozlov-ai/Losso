# 🔍 LOSSO — Повний аудит сайту та план правок
## Дата: 24.02.2026
## Сайт: https://losso-lemon.vercel.app
## Репо: https://github.com/romankozlov-ai/Losso

---

## ✅ Що зроблено добре

1. **Структура проекту** — Next.js App Router, правильна файлова організація
2. **Tailwind CSS** — підключений, стилі працюють
3. **Категорії та підкатегорії** — повна структура з Prom перенесена
4. **Товари** — 25 товарів з фото (images.prom.ua), цінами, SKU
5. **Кошик** — є кнопки "Додати в кошик" та "Огляд"
6. **Переваги** — блок з безкоштовною доставкою, оплатою, гарантією
7. **Відгуки** — секція з 4 відгуками
8. **Футер** — контакти, навігація, копірайт
9. **Маршрути** — /catalog, /product/[id], /cart, /delivery, /contacts
10. **lang="uk"** — встановлено в layout (важливо для SEO)

---

## 🔴 КРИТИЧНІ ПРОБЛЕМИ (виправити першочергово)

### 1. Немає robots.txt та sitemap.xml
Google не буде нормально індексувати сайт без цих файлів.

**Створити `app/robots.js`:**
```js
export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/cart', '/_next/'] },
    ],
    sitemap: 'https://losso-lemon.vercel.app/sitemap.xml',
  };
}
```

**Створити `app/sitemap.js`:**
```js
import { products } from '@/data/products'; // або звідки у вас дані
import { categories } from '@/data/categories';

export default function sitemap() {
  const baseUrl = 'https://losso-lemon.vercel.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contacts`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const productPages = products.map(p => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/catalog/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
```

### 2. Немає Open Graph мета-тегів
Коли хтось поділиться посиланням у Telegram/Viber/Facebook — буде порожній прев'ю.

**Оновити `app/layout.jsx` metadata:**
```js
export const metadata = {
  metadataBase: new URL('https://losso-lemon.vercel.app'),
  title: {
    default: 'LOSSO — інтернет-магазин товарів для дому та саду',
    template: '%s | LOSSO',
  },
  description: 'Магазин LOSSO — годинники, нічники, ваги, товари для кухні та саду. Оптом і в роздріб. Доставка по всій Україні.',
  keywords: ['LOSSO', 'товари для дому', 'інтернет-магазин', 'Україна', 'годинники', 'нічники'],
  openGraph: {
    title: 'LOSSO — інтернет-магазин товарів для дому та саду',
    description: 'Годинники, нічники, ваги, товари для кухні та саду. Оптом і в роздріб.',
    url: 'https://losso-lemon.vercel.app',
    siteName: 'LOSSO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'LOSSO' }],
    locale: 'uk_UA',
    type: 'website',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://losso-lemon.vercel.app' },
};
```

**Також створити OG-зображення** `public/og-image.jpg` (1200×630px) з логотипом LOSSO.

### 3. Немає сторінок privacy-policy та oferta
Обов'язково для: Google Ads, оплати, законодавства.

**Створити:**
- `app/privacy-policy/page.jsx` — з файлу losso-legal-pages.js
- `app/oferta/page.jsx` — з файлу losso-legal-pages.js

Додати посилання у Footer.

### 4. Немає favicon
Сайт без іконки у вкладці браузера виглядає непрофесійно.

**Додати:**
- `app/favicon.ico` — іконка 32×32
- `app/apple-icon.png` — 180×180
- `app/icon.png` — 192×192

---

## 🟡 ВАЖЛИВІ ПОКРАЩЕННЯ

### 5. Немає JSON-LD structured data для товарів
Google не покаже ціну товару у пошуку без цього.

**В `app/product/[id]/page.jsx` додати:**
```jsx
export default function ProductPage({ params }) {
  const product = getProduct(params.id);
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_ua,
    image: product.image_url,
    description: product.description_ua || product.name_ua,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "LOSSO" },
    offers: {
      "@type": "Offer",
      url: `https://losso-lemon.vercel.app/product/${product.id}`,
      priceCurrency: "UAH",
      price: product.price,
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* решта компоненту */}
    </>
  );
}
```

### 6. Сторінка товару — немає generateMetadata
Кожна сторінка товару повинна мати унікальний title і description для Google Ads.

**В `app/product/[id]/page.jsx`:**
```js
export async function generateMetadata({ params }) {
  const product = getProduct(params.id);
  return {
    title: `${product.name_ua} — купити | ${product.price} ₴`,
    description: `${product.name_ua}. Ціна: ${product.price} ₴. Оригінальна продукція LOSSO. Доставка по Україні.`,
    openGraph: {
      title: product.name_ua,
      description: `Купити ${product.name_ua} за ${product.price} ₴`,
      images: [{ url: product.image_url, width: 400, height: 400 }],
    },
  };
}
```

### 7. Сторінки категорій — те саме
**В `app/catalog/[category]/page.jsx`:**
```js
export async function generateMetadata({ params }) {
  const category = getCategory(params.category);
  return {
    title: `${category.name_ua} — каталог LOSSO`,
    description: `${category.name_ua} в інтернет-магазині LOSSO. Широкий вибір, доставка по Україні.`,
  };
}
```

### 8. Бейджі на товарах — не всі відображаються
На живому сайті лише "Хіт" видно у ліхтарика. Потрібно перевірити, що бейджі "Новинка" та "Акція" теж рендеряться для відповідних товарів (id: 12, 13, 19, 20).

### 9. Немає "стара ціна" / знижка
Товари 12 (Їжачок) і 13 (Китенок) мають old_price та discount_percent, але на сайті перекреслена ціна не показується. Потрібно додати відображення.

### 10. Чат-бот відсутній
На живому сайті немає чат-бота. Потрібно інтегрувати з файлу losso-redesign.jsx (компонент Chatbot з Gemini API).

**Додати `.env.local`:**
```
NEXT_PUBLIC_GEMINI_API_KEY=ваш_ключ
```

### 11. Немає пошуку по товарам
В хедері немає пошуку. Додати іконку 🔍 та модальне вікно пошуку.

### 12. Кошик — немає лічильника
На кнопці "Кошик" немає числа доданих товарів (badge). Потрібно додати.

### 13. Scroll-to-top кнопка відсутня

### 14. Telegram/Viber іконки у футері відсутні

---

## 🟢 ДОДАТКОВІ РЕКОМЕНДАЦІЇ (для повноцінної роботи)

### 15. Google Analytics / Google Tag Manager
Обов'язково для Google Ads. Додати GTM контейнер.

**В `app/layout.jsx`** додати перед `</head>`:
```jsx
{/* Google Tag Manager */}
<script dangerouslySetInnerHTML={{ __html: `
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
`}} />
```

### 16. Додати Google Merchant Center structured data
Для Google Shopping реклами потрібен правильний фід товарів. JSON-LD з пункту 5 вирішує це.

### 17. Швидкість: next/image замість img
Перевірити, що фото товарів використовують `<Image />` з Next.js для автоматичної оптимізації.

**В `next.config.js` має бути:**
```js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.prom.ua' },
    ],
  },
};
```

### 18. Форма контактів — куди йдуть дані?
На сторінці /contacts має бути форма. Перевірити що дані відправляються (Telegram бот, email, або SalesDrive).

### 19. Сторінка 404
Додати красиву сторінку для неіснуючих маршрутів.

**Створити `app/not-found.jsx`:**
```jsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-6xl font-bold text-green-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Сторінку не знайдено</p>
        <a href="/" className="px-6 py-3 bg-green-800 text-white rounded-full">
          На головну
        </a>
      </div>
    </div>
  );
}
```

### 20. PWA / Мобільна оптимізація
Додати `app/manifest.json` для можливості "Додати на головний екран" на телефоні:
```json
{
  "name": "LOSSO — товари для дому та саду",
  "short_name": "LOSSO",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a5c38",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 📊 Оновлення бази товарів

Зараз на сайті 25 товарів, але на Prom набагато більше (витрина показує ~24, але категорії мають десятки товарів). Для повного каталогу є 3 шляхи:

### Варіант А: Експорт з Prom (рекомендований)
1. Увійдіть в особистий кабінет Prom.ua
2. Товари → Експорт → Скачати XLS/CSV
3. Конвертуйте в JSON і покладіть в `data/products.js`

### Варіант Б: Prom API
```
GET https://my.prom.ua/api/v1/products/list
Header: Authorization: Bearer ваш_prom_api_token
```

### Варіант В: Supabase (довгостроково)
Підключити Supabase як описано в losso-supabase-admin.js та імпортувати товари через скрипт.

---

## ✅ ЧЕКЛИСТ ПЕРЕД ЗАПУСКОМ GOOGLE ADS

- [ ] robots.txt працює (перевірити: /robots.txt)
- [ ] sitemap.xml працює (перевірити: /sitemap.xml)
- [ ] Кожна сторінка має унікальний title та description
- [ ] Open Graph мета-теги (перевірити: https://metatags.io)
- [ ] JSON-LD structured data (перевірити: https://search.google.com/test/rich-results)
- [ ] Google Search Console підключений
- [ ] Google Tag Manager встановлений
- [ ] Favicon є
- [ ] Сторінка 404 оформлена
- [ ] Політика конфіденційності є та лінк в footer
- [ ] Публічна оферта є та лінк в footer
- [ ] Сайт адаптивний (перевірити на телефоні)
- [ ] Швидкість > 80 на PageSpeed Insights
- [ ] Форма замовлення працює
- [ ] Контактні дані актуальні

---

## 📁 Що ЩЕ потрібно додати з наших файлів

| Файл | Що взяти | Статус на сайті |
|---|---|---|
| losso-redesign.jsx | Чат-бот Gemini, пошук, scroll-top, анімації | ❌ Не інтегровано |
| losso-salesdrive-integration.jsx | Форма оформлення + SalesDrive API + Нова Пошта | ❌ Не інтегровано |
| losso-seo-config.js | robots, sitemap, JSON-LD, мета-теги | ❌ Не інтегровано |
| losso-legal-pages.js | Політика конфіденційності, Оферта | ❌ Не інтегровано |
| losso-supabase-admin.js | База даних, адмін-панель | ❌ Не інтегровано |
| losso-products-database.json | Товари вже є ✅ | ✅ Є 25 товарів |

---

## Пріоритети

### 🔴 Зробити ЗАРАЗ (без цього Google Ads не запустити):
1. robots.txt + sitemap.xml
2. Open Graph мета-теги
3. generateMetadata для товарів/категорій
4. JSON-LD structured data
5. Favicon
6. Політика конфіденційності + Оферта
7. Google Tag Manager

### 🟡 Зробити СКОРО:
8. Чат-бот Gemini
9. Пошук по товарам
10. Лічильник кошика
11. Стара ціна / знижка
12. Scroll-to-top
13. Telegram/Viber у футері
14. Сторінка 404
15. Форма замовлення → SalesDrive

### 🟢 Зробити ПОТІМ:
16. Supabase + адмін-панель
17. Повний каталог з Prom
18. PWA manifest
19. Google Analytics ecommerce tracking
