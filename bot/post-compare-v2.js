// Пост сравнения сучкорезов с 2 фото
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
    
    // Отправляем 2 фото в одном сообщении (media group)
    await bot.telegram.sendMediaGroup(config.CHANNEL_ID, [
      {
        type: 'photo',
        media: p1.image,
        caption: 
          `✂️ <b>Shuang Song BO-45 PRO</b>\n` +
          `💰 ${p1.price} грн\n\n` +
          `📏 Довжина: 68-95 см (телескопічний)\n` +
          `🌿 Ріже гілки до 45 мм\n` +
          `🔩 Сталь SK-5 з тефлоном\n` +
          `⚖️ Легкий (алюмінієві ручки)\n\n` +
          `👉 <b>Для дому та дачі</b>`,
        parse_mode: 'HTML'
      },
      {
        type: 'photo',
        media: p2.image,
        caption: 
          `🔧 <b>Sagawata SW-8172 PRO</b>\n` +
          `💰 ${p2.price} грн\n\n` +
          `⚙️ З <b>редуктором</b> (потужніший)\n` +
          `🌳 Для товстих і твердих гілок\n` +
          `💪 Менше зусиль при роботі\n` +
          `🎯 Професійний сегмент\n\n` +
          `👉 <b>Для серйозного саду</b>`
      }
    ]);
    
    // Отправляем сравнительную таблицу отдельным сообщением с кнопками
    await bot.telegram.sendMessage(config.CHANNEL_ID,
      `🌳 <b>ПОРІВНЯННЯ СУЧКОРІЗІВ</b>\n\n` +
      
      `┌─────────────────┬─────────────┬─────────────┐\n` +
      `│ Характеристика  │ BO-45 PRO   │ SW-8172 PRO │\n` +
      `├─────────────────┼─────────────┼─────────────┤\n` +
      `│ 💰 Ціна         │ ${p1.price} грн    │ ${p2.price} грн   │\n` +
      `│ 📏 Довжина      │ 68-95 см    │ Телескопічн │\n` +
      `│ 🌿 Діаметр      │ до 45 мм    │ Товсті гілки│\n` +
      `│ ⚙️ Механізм     │ Стандарт    │ ✨ Редуктор  │\n` +
      `│ ⚖️ Вага         │ Легкий      │ Середня     │\n` +
      `│ 🎯 Для кого     │ Дім/дача    │ Профі       │\n` +
      `└─────────────────┴─────────────┴─────────────┘\n\n` +
      
      `💡 <b>Висновок:</b>\n` +
      `• Для дому та дачі → беріть <b>Shuang Song</b> (дешевше, легший)\n` +
      `• Для роботи/великого саду → <b>Sagawata</b> (з редуктором)`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.url(`✂️ ${p1.price} грн`, `https://t.me/losso_shop_bot?start=buy_${p1.id}`),
              Markup.button.url(`🔧 ${p2.price} грн`, `https://t.me/losso_shop_bot?start=buy_${p2.id}`)
            ],
            [Markup.button.url('💬 Написати боту', 'https://t.me/losso_shop_bot')]
          ]
        }
      }
    );
    
    console.log('✅ Пост з двома фото та таблицею опубліковано!');
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

postComparison().then(() => process.exit(0));
