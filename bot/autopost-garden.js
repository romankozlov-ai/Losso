// Автопостинг садовых товаров в канал LOSSO
// Запуск: node autopost-garden.js

const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const bot = new Telegraf(config.BOT_TOKEN);

// Файл для отслеживания опубликованных товаров
const POSTED_FILE = path.join(__dirname, 'data', 'posted-garden.json');

// Загрузка списка уже опубликованных товаров
function loadPosted() {
  try {
    if (fs.existsSync(POSTED_FILE)) {
      return JSON.parse(fs.readFileSync(POSTED_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Ошибка загрузки posted:', e.message);
  }
  return { postedIds: [], lastPostDate: null };
}

// Сохранение списка опубликованных товаров
function savePosted(posted) {
  try {
    const dir = path.dirname(POSTED_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
  } catch (e) {
    console.error('Ошибка сохранения posted:', e.message);
  }
}

// Парсинг XML и получение садовых товаров
async function getGardenProducts() {
  const xmlPath = path.join(__dirname, 'config', 'products.xml');
  
  if (!fs.existsSync(xmlPath)) {
    throw new Error('Файл products.xml не найден');
  }
  
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  
  const offers = result.yml_catalog.shop[0].offers[0].offer;
  
  // Ключевые слова для садовых товаров
  const gardenKeywords = [
    'садов', 'секатор', 'сучкоріз', 'гілкоріз', 'підв\'яз', 'степлер', 
    'щеплен', 'грабел', 'лопат', 'ножиці садов', 'ножівка', 'кущоріз',
    'висоторіз', 'телескопічн', 'обрізн', 'пила садова'
  ];
  
  const gardenProducts = offers
    .filter(offer => {
      const name = offer.name?.[0] || '';
      const available = offer.$.available === 'true';
      const hasGardenKeyword = gardenKeywords.some(kw => 
        name.toLowerCase().includes(kw.toLowerCase())
      );
      return available && hasGardenKeyword;
    })
    .map(offer => ({
      id: offer.$.id,
      name: offer.name[0],
      price: parseInt(offer.price[0]),
      description: offer.description?.[0]?.substring(0, 300) + '...' || '',
      image: offer.picture?.[0] || null,
      category: offer.categoryId?.[0] || null
    }));
  
  return gardenProducts;
}

// Генерация текста поста
function generatePostText(product) {
  // Краткое описание из полного
  let shortDesc = '';
  if (product.description) {
    // Берём первые 2-3 предложения
    const sentences = product.description.split(/[.!?]+/).filter(s => s.trim().length > 20);
    shortDesc = sentences.slice(0, 2).join('. ') + '.';
    // Экранируем Markdown-спецсимволы
    shortDesc = shortDesc
      .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
      .replace(/\n/g, ' ');
  }
  
  // Экранируем название товара
  const escapedName = product.name.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  
  // Эмодзи по категориям
  const categoryEmoji = {
    'сучкоріз': '🌳',
    'секатор': '✂️',
    'степлер': '📎',
    'ножиці': '✂️',
    'підв\'яз': '📎',
    'щеплен': '🔪',
    'ножівка': '🪚',
    'пила': '🪚',
    'лопат': '🥄',
    'грабел': '🍂'
  };
  
  let emoji = '🌿';
  for (const [key, em] of Object.entries(categoryEmoji)) {
    if (product.name.toLowerCase().includes(key)) {
      emoji = em;
      break;
    }
  }
  
  const text = 
    `${emoji} *${escapedName}*\n\n` +
    `${shortDesc ? shortDesc + '\n\n' : ''}` +
    `💰 *Ціна: ${product.price} грн*\n\n` +
    `👇 Натисніть "🛒 Купити" та одразу перевірте *особисті повідомлення* з ботом!`;
  
  return text;
}

// Публикация товара в канал (с фото и улучшенными кнопками)
async function postToChannel(product) {
  try {
    const text = generatePostText(product);
    
    if (!product.image) {
      console.error('❌ Нет изображения для товара:', product.name);
      return false;
    }
    
    // Добавляем кнопки с ценой и эмодзи
    const emoji = product.name.toLowerCase().includes('сучкоріз') ? '🌳' :
                  product.name.toLowerCase().includes('секатор') ? '✂️' :
                  product.name.toLowerCase().includes('степлер') ? '📎' :
                  product.name.toLowerCase().includes('ножиці') ? '✂️' :
                  product.name.toLowerCase().includes('годинник') ? '🕐' : '🌿';
    
    await bot.telegram.sendPhoto(config.CHANNEL_ID, product.image, {
      caption: text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.url(`${emoji} Купити за ${product.price} грн`, `https://t.me/losso_shop_bot?start=buy_${product.id}`)],
          [Markup.button.url('🤖 AI помічник', 'https://t.me/losso_shop_bot')]
        ]
      }
    });
    
    console.log(`✅ Опубліковано з фото: ${product.name}`);
    return true;
  } catch (error) {
    console.error('❌ Помилка публікації:', error.message);
    return false;
  }
}

// Основная функция
async function main() {
  console.log('🚀 Запуск автопостинга садовых товаров...\n');
  
  try {
    // Загружаем список опубликованных
    const posted = loadPosted();
    console.log(`📋 Раніше опубліковано: ${posted.postedIds.length} товарів`);
    
    // Получаем садовые товары
    const products = await getGardenProducts();
    console.log(`🌿 Знайдено садових товарів: ${products.length}`);
    
    // Фильтруем неопубликованные
    const availableProducts = products.filter(p => !posted.postedIds.includes(p.id));
    console.log(`🆕 Доступно для публікації: ${availableProducts.length}`);
    
    if (availableProducts.length === 0) {
      console.log('⚠️ Всі товари вже опубліковані! Скидаємо список...');
      posted.postedIds = [];
      availableProducts.push(...products);
    }
    
    // Выбираем случайный товар
    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    const product = availableProducts[randomIndex];
    
    console.log(`\n📦 Публікуємо: ${product.name}`);
    console.log(`💰 Ціна: ${product.price} грн`);
    
    // Публикуем
    const success = await postToChannel(product);
    
    if (success) {
      // Сохраняем ID опубликованного товара
      posted.postedIds.push(product.id);
      posted.lastPostDate = new Date().toISOString();
      savePosted(posted);
      console.log('\n✅ Готово! Товар опубліковано в канал.');
    } else {
      console.error('\n❌ Не вдалося опублікувати товар.');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

main();
