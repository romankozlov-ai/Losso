/**
 * Категорії з Prom (losso.com.ua). Головні + підкатегорії.
 */
const categoriesFromProm = [
  {
    id: "tovary-dlya-domu",
    name_ua: "Товари для дому",
    emoji: "🏠",
    subcategories: [
      { id: "godynnyky", name_ua: "Годинники" },
      { id: "nichnyky-svitilnyky", name_ua: "Нічники, світильники, проектори" },
      { id: "tovary-dlya-kukhni", name_ua: "Товари для кухні" },
      { id: "karaoke-mikrofony", name_ua: "Караоке мікрофони" },
      { id: "yuvelirni-vahy", name_ua: "Ювелірні ваги" },
      { id: "vahy-pidlohovi", name_ua: "Ваги підлогові" },
      { id: "inshi-tovary-dlya-domu", name_ua: "Інші товари для дому" },
      { id: "doshovyky", name_ua: "Дощовики" },
      { id: "parasolky", name_ua: "Парасольки" },
      { id: "kantseliarske", name_ua: "Канцелярське приладдя" },
      { id: "optychni-prylady", name_ua: "Оптичні прилади" },
      { id: "ventyliatory", name_ua: "Вентилятори" },
      { id: "mashynky-kovtuntsi", name_ua: "Машинки для видалення ковтунців" },
      { id: "portyvni-kolonky", name_ua: "Портативні колонки" },
      { id: "zvolozhuvachy", name_ua: "Зволожувачі, термогігрометри" },
      { id: "podarunkovi-mishechky", name_ua: "Подарункові мішечки" },
    ],
  },
  {
    id: "tovary-dlya-sadu",
    name_ua: "Товари для саду та городу",
    emoji: "🌿",
    subcategories: [
      { id: "instrumenty-pidvyazuvannya", name_ua: "Інструменти для підв'язування рослин" },
      { id: "instrumenty-shcheplennya", name_ua: "Інструменти для щеплення дерев" },
      { id: "sekatory", name_ua: "Секатори" },
      { id: "sadovyi-elektroinstrument", name_ua: "Садовий електроінструмент" },
      { id: "sadovi-nozhytsi", name_ua: "Садові ножиці" },
      { id: "sadovi-pyly", name_ua: "Садові пили ножівки" },
      { id: "spetsialni-instrumenty", name_ua: "Спеціальні садові інструменти" },
      { id: "mishochky-fruktiv", name_ua: "Мішочки для захисту фруктів" },
      { id: "rukavychky", name_ua: "Рукавички" },
      { id: "tovary-polyvu", name_ua: "Товари для поливу" },
      { id: "lopatky-hrabelky", name_ua: "Лопатки та грабельки" },
    ],
  },
  {
    id: "budivelni-instrumenty",
    name_ua: "Будівельні інструменти для дому",
    emoji: "🔧",
    subcategories: [
      { id: "shablony-budivelni", name_ua: "Шаблони будівельні" },
      { id: "remontni-strichky", name_ua: "Ремонтні стрічки" },
      { id: "budivelni-aksesuary", name_ua: "Будівельні інструменти, аксесуари" },
    ],
  },
  {
    id: "energozabezpechennya",
    name_ua: "Енергозабезпечення",
    emoji: "⚡",
    subcategories: [
      { id: "portyvni-zaryadni", name_ua: "Портативні зарядні станції" },
      { id: "sonyachni-paneli", name_ua: "Портативні сонячні панелі" },
      { id: "zaryadni-avto", name_ua: "Зарядні пристрої для автомобіля" },
      { id: "merezhevi-zaryadni", name_ua: "Мережеві зарядні пристрої та кабелі" },
    ],
  },
];

export const mainCategories = categoriesFromProm.map((c) => ({
  id: c.id,
  name: c.name_ua,
  slug: c.id,
  emoji: c.emoji,
}));

/** Усі підкатегорії з parentSlug для навігації */
export const allSubcategories = categoriesFromProm.flatMap((c) =>
  c.subcategories.map((s) => ({
    id: s.id,
    name: s.name_ua,
    slug: s.id,
    parentSlug: c.id,
  }))
);

/** Підкатегорії тільки "Товари для дому" (для головної та каталогу) */
export const homeSubcategories = (categoriesFromProm.find((c) => c.id === "tovary-dlya-domu")?.subcategories || []).map((s) => ({
  id: s.id,
  name: s.name_ua,
  slug: s.id,
}));

export function getCategoryBySlug(slug) {
  const main = mainCategories.find((c) => c.slug === slug);
  if (main) return { ...main, isMain: true };
  const sub = allSubcategories.find((s) => s.slug === slug);
  if (sub) return { ...sub, isMain: false };
  return null;
}

export function getSubcategoriesByParent(parentSlug) {
  return allSubcategories.filter((s) => s.parentSlug === parentSlug);
}
