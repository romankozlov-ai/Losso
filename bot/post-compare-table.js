// Пост сравнения — красивая таблица без "рваных" линий
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const bot = new Telegraf(config.BOT_TOKEN);

async function getProductInfo(productId) {
  const xmlPath = path.join(__dirname, 'config', 'products.xml');
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  const offers = result.yml_catalog.shop[0].offers[0].offer;
  const offer = offers.find(o => o.$.id === String(productId));
  
  if (!offer) return null;
  
  return {
    id: offer.$.id,
    name: offer.name[0],
    price: parseInt(offer.price[0]),
    image: offer.picture?.[0] || null
  };
}

async function postComparison() {
  try {
    const p1 = await getProductInfo('1225697929'); // BO-45 PRO
    const p2 = await getProductInfo('2104567607'); // SW-8172 PRO
    
    if (!p1?.image || !p2?.image) {
      throw new Error('Фото не знайдено');
    }
    
    // Отправляем фото с подписями
    await bot.telegram.sendMediaGroup(config.CHANNEL_ID, [
      {
        type: 'photo',
        media: p1.image,
        caption: `📸 <b>ФОТО 1</b> — Shuang Song BO-45 PRO`
      },
      {
        type: 'photo',
        media: p2.image,
        caption: `📸 <b>ФОТО 2</b> — Sagawata SW-8172 PRO`
      }
    ]);
    
    // Красивая "таблица" через эмодзи и списки (без рваных линий)
    await bot.telegram.sendMessage(config.CHANNEL_ID,
      `🌳 <b>ПОРІВНЯННЯ СУЧКОРІЗІВ</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      
      `✂️ <b>Shuang Song BO-45 PRO</b>\n` +
      `   💰 Ціна: <b>${p1.price} грн</b>\n` +
      `   📏 Довжина: 68-95 см\n` +
      `   🌿 Гілки: до 45 мм\n` +
      `   🔩 Сталь: SK-5 з тефлоном\n` +
      `   ⚖️ Вага: Легкий\n` +
      `   🎯 Для: Дому та дачі\n\n` +
      
      `🔧 <b>Sagawata SW-8172 PRO</b>\n` +
      `   💰 Ціна: <b>${p2.price} грн</b>\n` +
      `   📏 Довжина: Телескопічна\n` +
      `   🌳 Гілки: Товсті, тверді\n` +
      `   ⚙️ Особливість: <b>Редуктор</b>\n` +
      `   💪 Зусилля: Менше\n` +
      `   🎯 Для: Профі / роботи\n\n` +
      
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 <b>Висновок:</b>\n` +
      `• Дім/дача → <b>ФОТО 1</b> (дешевше, легше)\n` +
      `• Робота/профі → <b>ФОТО 2</b> (редуктор)`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.url(`✂️ ${p1.price} грн (ФОТО 1)`, `https://t.me/losso_shop_bot?start=buy_${p1.id}`),
              Markup.button.url(`🔧 ${p2.price} грн (ФОТО 2)`, `https://t.me/losso_shop_bot?start=buy_${p2.id}`)
            ],
            [Markup.button.url('🤖 AI помічник', 'https://t.me/losso_shop_bot')]
          ]
        }
      }
    );
    
    console.log('✅ Пост з красивою таблицею опубліковано!');
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

postComparison().then(() => process.exit(0));
