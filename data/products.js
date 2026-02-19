export const products = [
  {
    id: "1",
    name: "Кухонний таймер механічний магнітний LOSSO KT-160098",
    price: 425,
    categorySlug: "tovary-dlya-kukhni",
    image: null,
    inStock: true,
  },
  {
    id: "2",
    name: "Вишнечистка LOSSO Premium CF-25",
    price: 330,
    categorySlug: "tovary-dlya-kukhni",
    image: null,
    inStock: true,
  },
  {
    id: "3",
    name: "Точилка для ножів кухонна LOSSO Premium WS-04",
    price: 385,
    categorySlug: "tovary-dlya-kukhni",
    image: null,
    inStock: true,
  },
  {
    id: "4",
    name: "Вакуумна пробка для вина Losso Premium KSP-9118",
    price: 185,
    categorySlug: "tovary-dlya-kukhni",
    image: null,
    inStock: true,
  },
  {
    id: "5",
    name: "Нічник LOSSO з USB",
    price: 299,
    categorySlug: "nichnyky-svitilnyky",
    image: null,
    inStock: true,
  },
  {
    id: "6",
    name: "Годинник настінний LOSSO",
    price: 450,
    categorySlug: "godynnyky",
    image: null,
    inStock: true,
  },
  {
    id: "7",
    name: "Годинники настільні електронні дзеркальні Losso Premium (BT) з LED підсвічуванням і термометром (білі), будильник",
    price: 690,
    categorySlug: "godynnyky",
    image: null,
    inStock: true,
    externalUrl: "https://losso.com.ua/ua/p1058879712-chasy-nastolnye-elektronnye.html",
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id) ?? null;
}

export function getProductsByCategory(categorySlug) {
  if (!categorySlug) return products;
  return products.filter((p) => p.categorySlug === categorySlug);
}
