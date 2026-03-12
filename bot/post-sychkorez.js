// Публикация поста про сучкорезы
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');

const bot = new Telegraf(config.BOT_TOKEN);

const postText = `🌳 Який сучкоріз обрати? Порівняння двох топових моделей

Друзі, часто питаєте: який сучкоріз кращий? 
Ось чесне порівняння двох наших бестселерів 👇

✂️ Shuang Song BO-45 PRO — 990 грн
Телескопічний (витягується до 95 см), ріже гілки до 45 мм. 
Сталь SK-5, тефлонове покриття лез — не іржавіє і не прилипає сік. 
Легкий завдяки алюмінієвим ручкам. Ідеальний для дому та дачі.

🔧 Sagawata SW-8172 PRO — 1250 грн  
Теж телескопічний, але з редуктором! Це значить: ріже товстіші 
і твердіші гілки з меншими зусиллями. Професійний інструмент 
для тих, хто серйозно займається садом.

💡 Висновок:
• Для дому/дачі — беріть Shuang Song, дешевше і з головою вистачить
• Для великого саду чи постійної роботи — Sagawata з редуктором

Обидва в наявності!`;

async function postToChannel() {
  try {
    await bot.telegram.sendMessage(config.CHANNEL_ID, postText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.url('🛒 Купити BO-45 PRO', 'https://t.me/losso_shop_bot?start=buy_1225697929')],
          [Markup.button.url('🛒 Купити SW-8172 PRO', 'https://t.me/losso_shop_bot?start=buy_2104567607')],
          [Markup.button.url('💬 Написати боту', 'https://t.me/losso_shop_bot')]
        ]
      }
    });
    console.log('✅ Пост про сучкорези опубліковано!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

postToChannel();
