// Публикация "Товар дня" з реальними даними з XML
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const bot = new Telegraf(config.BOT_TOKEN);

const POSTED_FILE = path.join(__dirname, 'data', 'posted-daily.json');

function loadPosted() {
  try {
    if (fs.existsSync(POSTED_FILE)) {
      return JSON.parse(fs.readFileSync(POSTED_FILE, 'utf8'));
    }
  } catch (e) {}
  return { postedIds: [], lastPostDate: null };
}

function savePosted(posted) {
  try {
    const dir = path.dirname(POSTED_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
  } catch (e) {}
}

// Отримання випадкового товару з реальними даними
async function getRandomProduct() {
  const xmlPath = path.join(__dirname, 'config', 'products.xml');
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  const offers = result.yml_catalog.shop[0].offers[0].offer;
  
  const posted = loadPosted();
  
  const available = offers.filter(o => {
    const id = o.$.id;
    const hasImage = o.picture?.[0];
    const inStock = o.$.available === 'true';
    const notPosted = !posted.postedIds.includes(id);
    return hasImage && inStock && notPosted;
  });
  
  if (available.length === 0) {
    posted.postedIds = [];
    savePosted(posted);
    return getRandomProduct();
  }
  
  const random = available[Math.floor(Math.random() * available.length)];
  
  return {
    id: random.$.id,
    name: random.name[0],
    price: parseInt(random.price[0]),
    image: random.picture[0],
    description: random.description?.[0] || '',
    vendor: random.vendor?.[0] || 'LOSSO',
    params: random.param || []
  };
}

// Визначення емодзі за типом товару
function getEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('годинник') && n.includes('настінний')) return '🕐';
  if (n.includes('годинник') && n.includes('настільний')) return '⏰';
  if (n.includes('сучкоріз') || n.includes('гілкоріз')) return '🌳';
  if (n.includes('секатор')) return '✂️';
  if (n.includes('степлер') || n.includes('підв\'яз')) return '📎';
  if (n.includes('нічник')) return '🌙';
  if (n.includes('проектор')) return '⭐';
  if (n.includes('мікрофон') || n.includes('караоке')) return '🎤';
  if (n.includes('вентилятор')) return '💨';
  if (n.includes('ваги')) return '⚖️';
  if (n.includes('чохол') || n.includes('бахіл')) return '👟';
  if (n.includes('ніж') || n.includes('ножівка')) return '🔪';
  if (n.includes('ліхтар')) return '🔦';
  if (n.includes('парасольк')) return '☂️';
  if (n.includes('дощовик')) return '🌧️';
  return '🎁';
}

// Витягнення ключових характеристик з опису
function extractFeatures(description, name) {
  if (!description) return [];
  
  // Розбиваємо опис на речення
  const sentences = description
    .replace(/<[^>]+>/g, '') // видаляємо HTML теги
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 150);
  
  // Шукаємо речення з перевагами
  const featureKeywords = ['призначений', 'виготовлений', 'дозволяє', 'забезпечує', 'оснащений', 'має', 'включає', 'відрізняється', 'перевага', 'особливість'];
  
  const features = sentences.filter(s => 
    featureKeywords.some(kw => s.toLowerCase().includes(kw))
  );
  
  // Якщо не знайшли — беремо перші 2-3 змістовні речення
  if (features.length === 0) {
    return sentences.slice(0, 3);
  }
  
  return features.slice(0, 3);
}

// Генерація поста з реальними даними
async function postDailyProduct() {
  try {
    const product = await getRandomProduct();
    const emoji = getEmoji(product.name);
    const features = extractFeatures(product.description, product.name);
    
    // Формуємо текст
    let caption = 
      `⭐ <b>ТОВАР ДНЯ</b>\n\n` +
      `${emoji} <b>${product.name}</b>\n` +
      `💰 <b>Ціна: ${product.price} грн</b>\n\n`;
    
    // Додаємо реальні характеристики
    if (features.length > 0) {
      caption += `❓ <b>Чому це варто купити?</b>\n\n`;
      features.forEach((feature, i) => {
        // Обрізаємо занадто довгі речення
        let shortFeature = feature;
        if (shortFeature.length > 120) {
          shortFeature = shortFeature.substring(0, 117) + '...';
        }
        caption += `✅ ${shortFeature}\n\n`;
      });
    }
    
    // Додаємо заклик до дії
    caption += `👇 <b>Замовляйте просто зараз:</b>`;
    
    await bot.telegram.sendPhoto(config.CHANNEL_ID, product.image, {
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.url(`🛒 Купити за ${product.price} грн`, `https://t.me/losso_shop_bot?start=buy_${product.id}`)],
          [Markup.button.url('🤖 AI помічник', 'https://t.me/losso_shop_bot')],
          [
            Markup.button.callback('👍 Цікаво', 'like_' + product.id)
          ]
        ]
      }
    });
    
    const posted = loadPosted();
    posted.postedIds.push(product.id);
    posted.lastPostDate = new Date().toISOString();
    savePosted(posted);
    
    console.log(`✅ "Товар дня" опубліковано: ${product.name}`);
    console.log(`📋 Використано реальних характеристик: ${features.length}`);
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

postDailyProduct().then(() => process.exit(0));
