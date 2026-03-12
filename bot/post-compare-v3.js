// Пост сравнения сучкорезов — понятный текст + фото
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
    
    // Отправляем 2 фото с подписями "Фото 1" и "Фото 2"
    await bot.telegram.sendMediaGroup(config.CHANNEL_ID, [
      {
        type: 'photo',
        media: p1.image,
        caption: `📸 <b>ФОТО 1 — Shuang Song BO-45 PRO</b> (${p1.price} грн)`
      },
      {
        type: 'photo',
        media: p2.image,
        caption: `📸 <b>ФОТО 2 — Sagawata SW-8172 PRO</b> (${p2.price} грн)`
      }
    ]);
    
    // Текстовое описание в стиле первого поста
    await bot.telegram.sendMessage(config.CHANNEL_ID,
      `🌳 <b>Який сучкоріз обрати?</b>\n\n` +
      `Друзі, часто питаєте: який кращий? Дивіться на фото вище і читайте порівняння 👇\n\n` +
      
      `✂️ <b>Shuang Song BO-45 PRO</b> (ФОТО 1) — ${p1.price} грн\n` +
      `• Телескопічний: витягується від 68 до 95 см\n` +
      `• Ріже гілки до 45 мм в діаметрі\n` +
      `• Японська сталь SK-5 з хромом\n` +
      `• Тефлонове покриття лез — не іржавіє\n` +
      `• Легкий завдяки алюмінієвим ручкам\n` +
      `• Ідеальний для дому та дачі\n\n` +
      
      `🔧 <b>Sagawata SW-8172 PRO</b> (ФОТО 2) — ${p2.price} грн\n` +
      `• Теж телескопічний, але з <b>редуктором</b>!\n` +
      `• Це значить: ріже товстіші гілки з меншими зусиллями\n` +
      `• Професійний інструмент для великого саду\n` +
      `• Для тих, хто серйозно займається обрізкою\n\n` +
      
      `💡 <b>Висновок:</b>\n` +
      `• Для дому/дачі — беріть <b>Shuang Song (ФОТО 1)</b>, дешевше і з головою вистачить\n` +
      `• Для великого саду чи роботи — <b>Sagawata (ФОТО 2)</b> з редуктором\n\n` +
      
      `Обидва в наявності! 👇`,
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
    
    console.log('✅ Пост опубліковано: фото + зрозумілий текст!');
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

postComparison().then(() => process.exit(0));
