// Скрипт для публикации постов в канал LOSSO
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');

const bot = new Telegraf(config.BOT_TOKEN);

// Товар: Степлер
const product = {
  id: '1037831384',
  name: 'Степлер для підв\'язки винограду LOSSO Тапенер SC-8105',
  price: 650,
  description: 'Садовий степлер для підв\'язки винограду, дерев та інших рослин. Швидкість роботи збільшується в 5-10 разів!',
  image: 'https://images.prom.ua/3678987401_stepler-dlya-pidvyazki.jpg'
};

// Функция публикации в канал
async function postToChannel() {
  try {
    const text = 
      `🛍️ *${product.name}*\n\n` +
      `📍 Садовий степлер для підв\'язки винограду, дерев та інших рослин\n\n` +
      `✅ Швидкість роботи збільшується в 5-10 разів\n` +
      `✅ Не пошкоджує стебла рослин\n` +
      `✅ Регульована ширина захоплення\n\n` +
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

    console.log('✅ Пост опубликован в канал!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

postToChannel();
