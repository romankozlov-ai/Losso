// npm install @supabase/supabase-js
// node scripts/import-products.js

/* eslint-disable no-console */

const { createClient } = require("@supabase/supabase-js");
// eslint-disable-next-line import/no-unresolved, global-require
const productsData = require("../losso-products-database.json");

const supabase = createClient(
  process.env.SUPABASE_URL || "https://xxxxx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJI...",
);

async function importAll() {
  console.log("🚀 Починаємо імпорт...");

  console.log("📂 Імпорт категорій...");
  for (const cat of productsData.categories) {
    // Головна категорія
    // eslint-disable-next-line no-await-in-loop
    await supabase.from("categories").upsert({
      id: cat.id,
      name_ua: cat.name_ua,
      name_ru: cat.name_ru || null,
      slug: cat.id,
      emoji: cat.emoji || "",
      prom_slug: cat.prom_slug || null,
      parent_id: null,
      is_active: true,
    });
    console.log("  ✅", cat.name_ua);

    if (cat.subcategories) {
      // eslint-disable-next-line no-restricted-syntax
      for (const sub of cat.subcategories) {
        // eslint-disable-next-line no-await-in-loop
        await supabase.from("categories").upsert({
          id: sub.id,
          name_ua: sub.name_ua,
          slug: sub.id,
          prom_slug: sub.prom_slug || null,
          parent_id: cat.id,
          is_active: true,
        });
        console.log("    ✅", sub.name_ua);
      }
    }
  }

  console.log("\n📦 Імпорт товарів...");
  // eslint-disable-next-line no-restricted-syntax
  for (const product of productsData.products) {
    const slug = product.name_ua
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100);

    const badgeMap = { Хіт: "hit", Новинка: "new", Акція: "sale" };

    // eslint-disable-next-line no-await-in-loop
    const { error } = await supabase.from("products").upsert({
      name_ua: product.name_ua,
      name_ru: product.name_ru || null,
      slug: `${slug}-${product.id}`,
      price: product.price,
      old_price: product.old_price || null,
      sku: product.sku || null,
      prom_id: product.prom_id || null,
      category_id: product.category || null,
      subcategory_id: product.subcategory || null,
      brand: product.brand || "LOSSO",
      image_url: product.image_url || null,
      badge: badgeMap[product.badge] || null,
      discount_percent: product.discount_percent || null,
      in_stock: product.in_stock !== false,
      wholesale: product.wholesale || false,
      is_active: true,
    });

    if (error) {
      console.log("  ❌", product.name_ua, error.message);
    } else {
      console.log("  ✅", product.name_ua, "—", product.price, "₴");
    }
  }

  console.log("\n🎉 Імпорт завершено!");
}

importAll().catch(console.error);

