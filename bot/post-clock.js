// Скрипт для публикации постів в канал LOSSO
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');

const bot = new Telegraf(config.BOT_TOKEN);

// Товар: Настільні годинники
const product = {
  id: '1037831389',
  name: 'Годинник електронний настільний дзеркальний Losso Premium',
  price: 395,
  description: 'Цифровий годинник з LED підсвічуванням, будильник, термометр. Безрамковий дизайн, працює від USB або батарейок.',
  image: 'https://images.prom.ua/6138344229_godinnik-elektronnij-nastilnij.jpg'
};

// Функция публикации в канал
async function postToChannel() {
  try {
    const text = 
      `🕐 *${product.name}*\n\n` +
      `📍 Електронний настільний годинник з LED підсвічуванням\n\n` +
      `✅ Сучасний дзеркальний дизайн\n` +
      `✅ Будильник з функцією повтору\n` +
      `✅ Термометр (відображення температури)\n` +
      `✅ Два формати часу (12/24)\n` +
      `✅ Регульована яскравість підсвічування\n` +
      `✅ Працює від USB або батарейок ААА\n\n` +
      `💰 *Ціна: ${product.price} грн*\n\n` +
      `👇 Натисніть "Купити" та одразу перевірте *особисті повідомлення* з ботом!`;

    // Отправляем фото с подписью и кнопкой
    await bot.telegram.sendPhoto(config.CHANNEL_ID, product.image, {
      caption: text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.url('🛒 Купити', `https://t.me/losso_shop_bot?start=buy_${product.id}`)],
          [Markup.button.url('💬 Написати боту', 'https://t.me/losso_shop_bot')]
        ]
      }
    });

    console.log('✅ Пост з годинником опубліковано в канал!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

postToChannel();
