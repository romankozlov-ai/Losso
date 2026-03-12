// Публикация сравнения товаров с фото в канал LOSSO
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const bot = new Telegraf(config.BOT_TOKEN);

// Функция получения информации о товаре из XML
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
    image: offer.picture?.[0] || null,
    description: offer.description?.[0]?.substring(0, 200) + '...' || ''
  };
}

// Функция публикации сравнения сучкорезов с фото
async function postSychkorezComparison() {
  try {
    // Получаем информацию о товарах
    const product1 = await getProductInfo('1225697929'); // BO-45 PRO
    const product2 = await getProductInfo('2104567607'); // SW-8172 PRO
    
    if (!product1 || !product2) {
      throw new Error('Не удалось найти товары в XML');
    }
    
    // Текст поста
    const caption = 
      `🌳 <b>Який сучкоріз обрати?</b>\n\n` +
      `Друзі, часто питаєте: який кращий? Ось чесне порівняння 👇\n\n` +
      
      `✂️ <b>Shuang Song BO-45 PRO</b> — ${product1.price} грн\n` +
      `• Телескопічний: 68-95 см\n` +
      `• Ріже гілки до 45 мм\n` +
      `• Японська сталь SK-5\n` +
      `• Тефлонове покриття лез\n` +
      `• Легкий (алюмінієві ручки)\n` +
      `👉 Ідеальний для дому та дачі\n\n` +
      
      `🔧 <b>Sagawata SW-8172 PRO</b> — ${product2.price} грн\n` +
      `• З редуктором (потужніший)\n` +
      `• Телескопічний\n` +
      `• Для товстих і твердих гілок\n` +
      `• Професійний сегмент\n` +
      `• Менше зусиль при роботі\n` +
      `👉 Для серйозного саду\n\n` +
      
      `💡 <b>Висновок:</b>\n` +
      `Для дому — BO-45 PRO, для роботи — SW-8172 PRO\n\n` +
      `Обидва в наявності! 👇`;
    
    // Отправляем первое фото с подписью
    await bot.telegram.sendPhoto(config.CHANNEL_ID, product1.image, {
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            Markup.button.url('🛒 BO-45 PRO', `https://t.me/losso_shop_bot?start=buy_${product1.id}`),
            Markup.button.url('🛒 SW-8172 PRO', `https://t.me/losso_shop_bot?start=buy_${product2.id}`)
          ],
          [Markup.button.url('💬 Написати боту', 'https://t.me/losso_shop_bot')],
          [Markup.button.url('📦 Всі садові товари', 'https://t.me/losso_shop_bot')]
        ]
      }
    });
    
    console.log('✅ Пост з фото опубліковано!');
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    // Fallback: постим без фото
    await postTextOnly();
  }
}

// Fallback: пост без фото
async function postTextOnly() {
  const text = 
    `🌳 Який сучкоріз обрати? Порівняння двох топових моделей\n\n` +
    `✂️ Shuang Song BO-45 PRO — 990 грн\n` +
    `Телескопічний (витягується до 95 см), ріже гілки до 45 мм. ` +
    `Сталь SK-5, тефлонове покриття. Ідеальний для дому.\n\n` +
    `🔧 Sagawata SW-8172 PRO — 1250 грн  \n` +
    `З редуктором! Ріже товстіші гілки з меншими зусиллями. ` +
    `Професійний інструмент для серйозного саду.\n\n` +
    `💡 Для дому — Shuang Song, для роботи — Sagawata`;
  
  await bot.telegram.sendMessage(config.CHANNEL_ID, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [Markup.button.url('🛒 Купити', 'https://t.me/losso_shop_bot')]
      ]
    }
  });
}

// Альтернативная функция: пост с медиа-группой (2 фото)
async function postWithMediaGroup() {
  try {
    const product1 = await getProductInfo('1225697929');
    const product2 = await getProductInfo('2104567607');
    
    if (!product1?.image || !product2?.image) {
      throw new Error('Нет фото');
    }
    
    // Отправляем медиа-группу
    await bot.telegram.sendMediaGroup(config.CHANNEL_ID, [
      {
        type: 'photo',
        media: product1.image,
        caption: `✂️ <b>Shuang Song BO-45 PRO</b> — ${product1.price} грн\n\n` +
                 `Телескопічний, ріже до 45 мм. Ідеальний для дому та дачі.`,
        parse_mode: 'HTML'
      },
      {
        type: 'photo',
        media: product2.image,
        caption: `🔧 <b>Sagawata SW-8172 PRO</b> — ${product2.price} грн\n\n` +
                 `З редуктором! Для товстих гілок. Професійний інструмент.`
      }
    ]);
    
    // Отправляем сообщение с кнопками отдельно
    await bot.telegram.sendMessage(config.CHANNEL_ID, 
      `🌳 <b>Який обереш ти?</b>\n\n` +
      `💡 Для дому/дачі — BO-45 PRO (дешевше)\n` +
      `💡 Для роботи — SW-8172 PRO (потужніший)`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.url('🛒 BO-45 PRO', `https://t.me/losso_shop_bot?start=buy_${product1.id}`),
              Markup.button.url('🛒 SW-8172 PRO', `https://t.me/losso_shop_bot?start=buy_${product2.id}`)
            ],
            [Markup.button.url('💬 Запитати в бота', 'https://t.me/losso_shop_bot')]
          ]
        }
      }
    );
    
    console.log('✅ Медіа-група опублікована!');
    
  } catch (error) {
    console.error('❌ Помилка media group:', error.message);
    await postSychkorezComparison();
  }
}

// Запускаем
postWithMediaGroup().then(() => process.exit(0)).catch(() => process.exit(1));
