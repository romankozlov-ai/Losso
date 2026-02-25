# 🔧 LOSSO — Точні правки для Cursor
# Дата: 25.02.2026
# Статус: Нічого з попереднього аудиту НЕ додано. Потрібно все.

---

## СТАТУС САЙТУ (перевірено 25.02.2026)

### ✅ Є на сайті:
- Next.js App Router + Tailwind ✅
- Головна з категоріями, товарами, перевагами, відгуками ✅
- 25 товарів з images.prom.ua ✅
- Маршрути: /, /catalog, /product/[id], /cart, /delivery, /contacts ✅
- lang="uk" в layout ✅
- Хедер з навігацією ✅
- Футер з контактами ✅

### ❌ Відсутнє (потрібно додати):
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] Open Graph мета-теги
- [ ] generateMetadata для товарів та категорій
- [ ] JSON-LD structured data
- [ ] Favicon
- [ ] Сторінка Політика конфіденційності
- [ ] Сторінка Публічна оферта
- [ ] Посилання на юридичні сторінки у футері
- [ ] Сторінка 404
- [ ] Чат-бот Gemini
- [ ] Пошук по товарам
- [ ] Лічильник товарів в кошику (badge)
- [ ] Відображення старої ціни / знижки
- [ ] Scroll-to-top кнопка
- [ ] Telegram/Viber іконки у футері
- [ ] Google Tag Manager
- [ ] PWA manifest
- [ ] Форма оформлення замовлення → SalesDrive
- [ ] Інтеграція з Новою Поштою (пошук міст/відділень)

---

## 🔴 БЛОК 1: SEO (КРИТИЧНО для Google Ads)

### 1.1 Створити `app/robots.js`
```js
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/cart', '/_next/'],
      },
    ],
    sitemap: 'https://losso-lemon.vercel.app/sitemap.xml',
  };
}
```

### 1.2 Створити `app/sitemap.js`
```js
import { products } from '@/data/products';
import { categories } from '@/data/categories';

export default function sitemap() {
  const baseUrl = 'https://losso-lemon.vercel.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contacts`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/oferta`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productPages = (products || []).map(p => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const mainCategories = (categories || []).filter(c => !c.parent_id);
  const categoryPages = mainCategories.map(cat => ({
    url: `${baseUrl}/catalog/${cat.id || cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
```

### 1.3 Оновити metadata в `app/layout.jsx`
Замінити існуючий export metadata на:
```js
export const metadata = {
  metadataBase: new URL('https://losso-lemon.vercel.app'),
  title: {
    default: 'LOSSO — інтернет-магазин товарів для дому та саду',
    template: '%s | LOSSO',
  },
  description: 'Магазин LOSSO — годинники, нічники, ваги, товари для кухні та саду. Оптом і в роздріб. Доставка по всій Україні.',
  keywords: ['LOSSO', 'товари для дому', 'товари для саду', 'інтернет-магазин', 'Україна', 'годинники', 'нічники', 'караоке мікрофони'],
  authors: [{ name: 'LOSSO' }],
  openGraph: {
    title: 'LOSSO — інтернет-магазин товарів для дому та саду',
    description: 'Годинники, нічники, ваги, товари для кухні та саду. Оптом і в роздріб. Доставка по Україні.',
    url: 'https://losso-lemon.vercel.app',
    siteName: 'LOSSO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'LOSSO — товари для дому та саду' }],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOSSO — інтернет-магазин товарів для дому та саду',
    description: 'Годинники, нічники, ваги, товари для кухні та саду.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://losso-lemon.vercel.app' },
};
```

### 1.4 Додати generateMetadata в `app/product/[id]/page.jsx`
Додати перед компонентом:
```js
export async function generateMetadata({ params }) {
  // Знайти товар за id — адаптувати під ваш спосіб отримання даних
  const { products } = await import('@/data/products');
  const product = products.find(p => String(p.id) === String(params.id));
  if (!product) return { title: 'Товар не знайдено | LOSSO' };

  return {
    title: `${product.name_ua} — купити | ${product.price} ₴`,
    description: `${product.name_ua}. Ціна: ${product.price} ₴. ${product.in_stock !== false ? 'В наявності.' : 'Немає в наявності.'} Доставка по Україні.`,
    openGraph: {
      title: `${product.name_ua} | LOSSO`,
      description: `Купити ${product.name_ua} за ${product.price} ₴ в інтернет-магазині LOSSO`,
      images: [{ url: product.image_url, width: 400, height: 400, alt: product.name_ua }],
      type: 'website',
    },
  };
}
```

### 1.5 Додати JSON-LD structured data в `app/product/[id]/page.jsx`
Додати всередині компоненту сторінки товару (перед return або першим елементом):
```jsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name_ua,
  image: product.image_url,
  description: product.description_ua || `${product.name_ua} — оригінальна продукція. Доставка по Україні.`,
  sku: product.sku || '',
  brand: { "@type": "Brand", name: product.brand || "LOSSO" },
  offers: {
    "@type": "Offer",
    url: `https://losso-lemon.vercel.app/product/${product.id}`,
    priceCurrency: "UAH",
    price: product.price,
    availability: product.in_stock !== false
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    seller: { "@type": "Organization", name: "Торгова компанія LOSSO" },
  },
};

// Додати в JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

### 1.6 Додати generateMetadata в `app/catalog/[category]/page.jsx`
```js
export async function generateMetadata({ params }) {
  const { categories } = await import('@/data/categories');
  const category = categories.find(c => c.id === params.category || c.slug === params.category);
  const name = category?.name_ua || params.category;

  return {
    title: `${name} — каталог LOSSO`,
    description: `${name} в інтернет-магазині LOSSO. Широкий вибір, доставка по Україні, зручна оплата. Оптом і в роздріб.`,
  };
}
```

---

## 🔴 БЛОК 2: Юридичні сторінки

### 2.1 Створити `app/privacy-policy/page.jsx`
(Повний текст — взяти з файлу losso-legal-pages.js який ми створювали раніше)
Мінімальна структура:
```jsx
export const metadata = {
  title: 'Політика конфіденційності',
  description: 'Політика конфіденційності інтернет-магазину LOSSO.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Політика конфіденційності</h1>
      {/* Вставити повний текст з losso-legal-pages.js */}
    </div>
  );
}
```

### 2.2 Створити `app/oferta/page.jsx`
Аналогічно — текст з losso-legal-pages.js.

### 2.3 Додати посилання у Footer
```jsx
<div>
  <h4>Документи</h4>
  <a href="/privacy-policy">Політика конфіденційності</a>
  <a href="/oferta">Публічна оферта</a>
</div>
```

---

## 🔴 БЛОК 3: Favicon та OG Image

### 3.1 Створити favicon
Потрібно створити або згенерувати:
- `app/favicon.ico` — 32×32
- `app/icon.png` — 192×192 (для Android)
- `app/apple-icon.png` — 180×180 (для iOS)

Як мінімум — покласти будь-який .ico файл з літерою "L" або логотипом LOSSO.
Генератор: https://favicon.io/favicon-generator/ — ввести "L", обрати зелений (#1a5c38).

### 3.2 Створити OG Image
Потрібен файл `public/og-image.jpg` розміром 1200×630px.
Зміст: логотип LOSSO + текст "Товари для дому та саду" + зелений фон.
Генератор: https://og-image.vercel.app/ або Canva.

---

## 🟡 БЛОК 4: Сторінка 404

### 4.1 Створити `app/not-found.jsx`
```jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-7xl font-bold text-green-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Сторінку не знайдено</h2>
        <p className="text-gray-500 mb-8">На жаль, ця сторінка не існує або була видалена.</p>
        <Link href="/" className="inline-block px-8 py-3 bg-green-800 text-white rounded-full hover:bg-green-700 transition">
          На головну
        </Link>
      </div>
    </div>
  );
}
```

---

## 🟡 БЛОК 5: Покращення UI

### 5.1 Лічильник кошика в хедері
В Header компоненті, біля іконки/кнопки "Кошик" додати badge:
```jsx
// Якщо використовується CartContext:
const { items } = useCart(); // або ваш спосіб отримання кількості
const count = items.reduce((sum, item) => sum + (item.qty || 1), 0);

// В JSX:
<Link href="/cart" className="relative">
  🛒 Кошик
  {count > 0 && (
    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {count}
    </span>
  )}
</Link>
```

### 5.2 Відображення старої ціни та знижки
В ProductCard компоненті додати:
```jsx
{product.old_price && (
  <span className="line-through text-gray-400 text-sm mr-2">{product.old_price} ₴</span>
)}
<span className="text-lg font-bold">{product.price} ₴</span>
{product.discount_percent && (
  <span className="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
    -{product.discount_percent}%
  </span>
)}
```

### 5.3 Бейджі — перевірити всі типи
На сайті "Хіт" показується, але "Новинка" і "Акція" — ні. Переконатися що маппінг badge → відображення працює:
```jsx
const BADGE_MAP = {
  'Хіт': { text: 'Хіт', className: 'bg-orange-500 text-white' },
  'Новинка': { text: 'Новинка', className: 'bg-blue-500 text-white' },
  'Акція': { text: 'Акція', className: 'bg-red-500 text-white' },
  'hit': { text: 'Хіт', className: 'bg-orange-500 text-white' },
  'new': { text: 'Новинка', className: 'bg-blue-500 text-white' },
  'sale': { text: 'Акція', className: 'bg-red-500 text-white' },
};

// В картці товару:
{product.badge && BADGE_MAP[product.badge] && (
  <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold ${BADGE_MAP[product.badge].className}`}>
    {BADGE_MAP[product.badge].text}
  </span>
)}
```

### 5.4 Scroll-to-top кнопка
Створити `components/ScrollToTop.jsx`:
```jsx
'use client';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition"
      aria-label="Нагору"
    >
      ↑
    </button>
  );
}
```
Додати в `app/layout.jsx` перед `</body>`:
```jsx
<ScrollToTop />
```

### 5.5 Telegram/Viber у футері
```jsx
<div className="flex gap-3 mt-4">
  <a href="https://t.me/+380980402500" target="_blank" rel="noopener noreferrer"
     className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600">
    {/* Telegram SVG icon */}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  </a>
  <a href="viber://chat?number=%2B380980402500" className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600">
    {/* Viber icon — можна використати текст */}
    <span className="text-sm font-bold">V</span>
  </a>
</div>
```

---

## 🟡 БЛОК 6: PWA Manifest

### 6.1 Створити `public/manifest.json`
```json
{
  "name": "LOSSO — товари для дому та саду",
  "short_name": "LOSSO",
  "description": "Інтернет-магазин товарів для дому та саду",
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

В `app/layout.jsx` додати в metadata:
```js
manifest: '/manifest.json',
```

---

## 🟡 БЛОК 7: Organization JSON-LD (на головній)

В `app/page.jsx` додати:
```jsx
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Торгова компанія LOSSO",
  url: "https://losso-lemon.vercel.app",
  logo: "https://losso-lemon.vercel.app/icon-512.png",
  description: "Інтернет-магазин товарів для дому та саду",
  address: {
    "@type": "PostalAddress",
    streetAddress: "вул. Новопрорізна 4",
    addressLocality: "Бориспіль",
    addressRegion: "Київська область",
    addressCountry: "UA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+380980402500",
    contactType: "sales",
    availableLanguage: ["Ukrainian"],
    areaServed: "UA",
  },
};

// В JSX перед іншим контентом:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
```

---

## 🟢 БЛОК 8: Інтеграції (наступний крок)

Ці файли ми вже створили. Потрібно їх інтегрувати:

| Файл | Що додати | Як |
|---|---|---|
| losso-redesign.jsx | Компонент Chatbot (Gemini) | Скопіювати функцію Chatbot() та вставити в components/Chatbot.jsx, підключити в layout |
| losso-salesdrive-integration.jsx | Форма оформлення + SalesDrive API + Нова Пошта | Розкласти по lib/salesdrive.js, lib/novaposhta.js, app/api/orders/route.js, components/CheckoutForm.jsx |
| losso-supabase-admin.js | БД + адмінка | Коли будете готові до Supabase: SQL, lib/supabase.js, lib/db.js, app/admin/page.jsx |

---

## 📋 ПОРЯДОК ДІЙ ДЛЯ CURSOR

Скопіюйте це повідомлення в Cursor і скажіть:

> «Ось план правок для проєкту LOSSO. Виконай по блоках:
> 
> 1. БЛОК 1 — SEO: створи robots.js, sitemap.js, онови metadata, додай generateMetadata та JSON-LD
> 2. БЛОК 2 — Юридичні сторінки: створи privacy-policy та oferta, додай посилання у Footer
> 3. БЛОК 3 — Favicon (згенеруй простий з літерою L) + створи placeholder og-image
> 4. БЛОК 4 — Сторінка 404
> 5. БЛОК 5 — UI: лічильник кошика, стара ціна, бейджі, scroll-to-top, Telegram/Viber
> 6. БЛОК 6 — PWA manifest
> 7. БЛОК 7 — Organization JSON-LD на головній
> 
> Код для кожного блоку є в файлі. Адаптуй імпорти під існуючу структуру проєкту.»

---

## ✅ Після всіх правок — перевірити:
1. https://losso-lemon.vercel.app/robots.txt — має відкритись
2. https://losso-lemon.vercel.app/sitemap.xml — має відкритись
3. https://losso-lemon.vercel.app/privacy-policy — має бути сторінка
4. https://losso-lemon.vercel.app/oferta — має бути сторінка
5. https://metatags.io — вставити URL, перевірити OG теги
6. https://search.google.com/test/rich-results — перевірити JSON-LD
7. PageSpeed Insights — перевірити швидкість (> 80)
