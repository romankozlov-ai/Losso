// AI помічник з доступом до всіх товарів з XML
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

let productsCache = null;
let cacheTime = null;

// Завантаження всіх товарів в кеш (оновлюється кожні 5 хвилин)
async function loadProductsCache() {
  const now = Date.now();
  if (productsCache && cacheTime && (now - cacheTime) < 5 * 60 * 1000) {
    return productsCache;
  }
  
  try {
    const xmlPath = path.join(__dirname, '../config/products.xml');
    const xml = fs.readFileSync(xmlPath, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    const offers = result.yml_catalog.shop[0].offers[0].offer;
    
    productsCache = offers.map(offer => ({
      id: offer.$.id,
      name: offer.name[0],
      price: parseInt(offer.price[0]),
      available: offer.$.available === 'true',
      description: offer.description?.[0] || '',
      vendor: offer.vendor?.[0] || 'LOSSO',
      image: offer.picture?.[0] || null,
      categoryId: offer.categoryId?.[0] || null,
      params: offer.param || []
    }));
    
    cacheTime = now;
    console.log(`✅ AI: Завантажено ${productsCache.length} товарів в кеш`);
    return productsCache;
  } catch (e) {
    console.error('❌ AI: Помилка завантаження товарів:', e.message);
    return productsCache || [];
  }
}

// Пошук товарів за ключовими словами
async function searchProducts(query, limit = 3) {
  const products = await loadProductsCache();
  const q = query.toLowerCase();
  
  // Шукаємо за назвою та описом
  const results = products
    .filter(p => p.available) // тільки в наявності
    .map(p => {
      let score = 0;
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();
      
      // Точне співпадіння в назві - вищий бал
      if (name.includes(q)) score += 10;
      // Часткове співпадіння слів
      const words = q.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          if (name.includes(word)) score += 3;
          if (desc.includes(word)) score += 1;
        }
      });
      
      return { ...p, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return results;
}

// Отримання інформації про конкретний товар за ID
async function getProductById(productId) {
  const products = await loadProductsCache();
  return products.find(p => p.id === String(productId));
}

// Формування контексту для AI
async function buildAIContext(userQuestion) {
  const relevantProducts = await searchProducts(userQuestion, 3);
  
  if (relevantProducts.length === 0) {
    return null;
  }
  
  let context = 'Інформація про товари з магазину LOSSO:\n\n';
  
  relevantProducts.forEach((p, i) => {
    context += `${i + 1}. ${p.name}\n`;
    context += `Ціна: ${p.price} грн\n`;
    
    // Беремо перші 300 символів опису
    const shortDesc = p.description.substring(0, 300).replace(/<[^>]+>/g, '');
    if (shortDesc) {
      context += `Опис: ${shortDesc}${p.description.length > 300 ? '...' : ''}\n`;
    }
    
    if (p.params && p.params.length > 0) {
      context += 'Характеристики:\n';
      p.params.slice(0, 5).forEach(param => {
        if (param.$ && param.$.name && param._) {
          context += `- ${param.$.name}: ${param._}\n`;
        }
      });
    }
    
    context += '\n';
  });
  
  return { context, products: relevantProducts };
}

// Головна функція для обробки запиту користувача
async function processUserQuestion(userQuestion, userId) {
  const searchResult = await buildAIContext(userQuestion);
  
  if (!searchResult) {
    return {
      hasProducts: false,
      answer: 'На жаль, не знайшов товарів за вашим запитом. Спробуйте інші ключові слова або напишіть "каталог" для перегляду всіх товарів.'
    };
  }
  
  return {
    hasProducts: true,
    context: searchResult.context,
    products: searchResult.products,
    answer: null // AI має згенерувати відповідь на основі контексту
  };
}

module.exports = {
  loadProductsCache,
  searchProducts,
  getProductById,
  buildAIContext,
  processUserQuestion
};
