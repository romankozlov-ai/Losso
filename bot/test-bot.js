// Тестовый скрипт для проверки бота
const { Telegraf } = require('telegraf');
const config = require('./config/config');

const bot = new Telegraf(config.BOT_TOKEN);

bot.command('start', (ctx) => {
  console.log('[TEST] /start from', ctx.from.id);
  ctx.reply('✅ Бот работает! Ваш ID: ' + ctx.from.id);
});

bot.on('text', (ctx) => {
  console.log('[TEST] Text from', ctx.from.id, ':', ctx.message.text);
  ctx.reply('Получил: ' + ctx.message.text);
});

console.log('🚀 Тестовый бот запущен...');
bot.launch();
