// Простейший парсер losso.com.ua для выгрузки товаров по категориям.
// Запуск: из папки проекта Losso
//   node scripts/scrape-losso.mjs

import fs from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://losso.com.ua";

// TODO: сюда ВРУЧНУЮ добавляем адреса страниц‑категорий losso.com.ua, которые нужно спарсить.
// Примеры (просто как шаблон, надо заменить на реальные URL сайта):
// "https://losso.com.ua/uk/godynnyky",
// "https://losso.com.ua/uk/tovary-dlya-kuhni",
const CATEGORY_URLS = [
  // "https://losso.com.ua/...",
];

async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
    },
    timeout: 20000,
  });
  return res.data;
}

async function scrapeCategory(url) {
  console.log("Категория:", url);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const products = [];

  // ВНИМАНИЕ: классы .product-item, .product-card и т.п. нужно будет
  // при необходимости подправить под реальную разметку losso.com.ua.
  $(".product-item, .product-card").each((_, el) => {
    const $el = $(el);

    const name =
      $el.find(".product-title a, .product-name a, .product-title").text().trim() ||
      $el.find("a").first().text().trim();

    const priceText =
      $el.find(".price, .product-price, .product-item-price").first().text().trim();
    const price = parseInt(priceText.replace(/\D+/g, ""), 10) || null;

    const linkPart =
      $el.find(".product-title a, .product-name a, a").attr("href") || "";
    const urlFull = linkPart.startsWith("http") ? linkPart : BASE_URL + linkPart;

    const imgSrc =
      $el.find("img").attr("data-src") ||
      $el.find("img").attr("src") ||
      null;
    const imageUrl =
      imgSrc && !imgSrc.startsWith("http") ? BASE_URL + imgSrc : imgSrc;

    if (!name) return;

    products.push({
      name,
      price,
      url: urlFull,
      imageUrl,
      categoryUrl: url,
    });
  });

  console.log(`  найдено товаров: ${products.length}`);
  return products;
}

async function main() {
  if (CATEGORY_URLS.length === 0) {
    console.error(
      "Сначала добавь ссылки категорий в массив CATEGORY_URLS в scripts/scrape-losso.mjs",
    );
    process.exit(1);
  }

  const allProducts = [];

  for (const catUrl of CATEGORY_URLS) {
    try {
      const products = await scrapeCategory(catUrl);
      allProducts.push(...products);
    } catch (e) {
      console.error("Ошибка при обработке категории:", catUrl, e.message);
    }
  }

  const outDir = path.join(process.cwd(), "export");
  await fs.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, "products.json");
  await fs.writeFile(outPath, JSON.stringify(allProducts, null, 2), "utf8");

  console.log(`Готово. Сохранено ${allProducts.length} товаров в ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

