export const mainCategories = [
  { id: "home", name: "Товари для дому", slug: "tovary-dlya-domu" },
  { id: "garden", name: "Товари для саду та городу", slug: "tovary-dlya-sadu" },
  { id: "tools", name: "Будівельні інструменти", slug: "budivelni-instrumenty" },
  { id: "energy", name: "Енергозабезпечення", slug: "energozabezpechennya" },
];

export const homeSubcategories = [
  { id: "clocks", name: "Годинники", slug: "godynnyky" },
  { id: "lights", name: "Нічники, світильники", slug: "nichnyky-svitilnyky" },
  { id: "kitchen", name: "Товари для кухні", slug: "tovary-dlya-kukhni" },
  { id: "karaoke", name: "Караоке мікрофони", slug: "karaoke-mikrofony" },
  { id: "umbrellas", name: "Дощовики, парасольки", slug: "doshovyky-parasolky" },
  { id: "stationery", name: "Канцелярське приладдя", slug: "kantseliarske" },
];

export function getCategoryBySlug(slug) {
  const all = [...mainCategories, ...homeSubcategories];
  return all.find((c) => c.slug === slug) ?? null;
}
