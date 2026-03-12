// LOSSO Bot - Простая версия
const { Telegraf, Markup } = require('telegraf');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// Проверка конфигурации
if (!config.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не задан в config.js!');
  process.exit(1);
}

const bot = new Telegraf(config.BOT_TOKEN);

// Хранилище заказов
const orders = {};

// Загрузка товаров из YML
let productsDB = {};
function loadProducts() {
  try {
    const ymlPath = path.join(__dirname, '../config/products.xml');
    if (fs.existsSync(ymlPath)) {
      const xml = fs.readFileSync(ymlPath, 'utf8');
      // Простой парсинг - ищем offer с id
      const offerMatches = xml.match(/<offer[^>]*>.*?<\/offer>/gs);
      if (offerMatches) {
        offerMatches.slice(0, 20).forEach(offer => { // Первые 20 товаров
          const idMatch = offer.match(/id="(\d+)"/);
          const nameMatch = offer.match(/<name>([^<]+)<\/name>/);
          const priceMatch = offer.match(/<price>(\d+)<\/price>/);
          const availableMatch = offer.match(/available="(true|false)"/);
          
          if (idMatch && nameMatch && priceMatch) {
            productsDB[idMatch[1]] = {
              id: idMatch[1],
              name: nameMatch[1],
              price: parseInt(priceMatch[1]),
              inStock: availableMatch ? availableMatch[1] === 'true' : true
            };
          }
        });
      }
      console.log(`✅ Загружено ${Object.keys(productsDB).length} товаров`);
    }
  } catch (err) {
    console.error('❌ Ошибка загрузки товаров:', err.message);
  }
}

loadProducts();

// Логирование
console.log('🚀 Бот LOSSO запущений!');
console.log(`📱 Канал: ${config.CHANNEL_ID || '@losso_shop'}`);

// Получить товар по ID
function getProduct(productId) {
  return productsDB[productId] || {
    id: productId,
    name: 'Товар #' + productId,
    price: 0,
    inStock: false
  };
}

// Команда /start
bot.command('start', (ctx) => {
  console.log(`[LOG] /start от ${ctx.from.id} (${ctx.from.username || 'no username'})`);
  ctx.reply(
    '👋 Вітаємо у магазині LOSSO!\n\nОберіть дію:',
    Markup.keyboard([
      ['🛍️ Каталог товарів', '❓ Допомога'],
      ['📞 Контакти', '📋 Мої замовлення']
    ]).resize()
  );
});

// Меню
bot.hears('🛍️ Каталог товарів', (ctx) => {
  ctx.reply(
    '🛍️ Наші товари: @losso_shop\n\nНатисніть «Купити» під товаром',
    Markup.inlineKeyboard([Markup.button.url('📱 Перейти в канал', 'https://t.me/losso_shop')])
  );
});

bot.hears('❓ Допомога', (ctx) => {
  ctx.reply(
    '❓ Як замовити:\n\n' +
    '1️⃣ Оберіть товар у каналі\n' +
    '2️⃣ Натисніть «Купити»\n' +
    '3️⃣ Вкажіть кількість та дані\n' +
    '4️⃣ Оплатіть\n' +
    '5️⃣ Отримайте трек-номер'
  );
});

bot.hears('📞 Контакти', (ctx) => {
  ctx.reply(
    '📞 Контакти:\n' +
    '• Канал: @losso_shop\n' +
    '⏰ Пн-Пт: 09:00-18:00\n' +
    '⏰ Сб-Нд: 10:00-15:00\n\n' +
    '🚚 Відправка до 15:00 — сьогодні'
  );
});

bot.hears('📋 Мої замовлення', (ctx) => {
  ctx.reply('📋 У вас поки немає замовлень.');
});

// Купить товар
bot.action(/buy_(.+)/, async (ctx) => {
  const productId = ctx.match[1];
  const userId = ctx.from.id;
  
  const product = getProduct(productId);
  
  if (!product.inStock || product.price === 0) {
    return ctx.answerCbQuery('⚠️ Товар закінчився або недоступний');
  }
  
  console.log(`[LOG] Покупка товара ${productId} пользователем ${userId}`);
  
  // Сохраняем начало заказа
  orders[userId] = {
    product: product,
    step: 'qty'
  };
  
  await ctx.answerCbQuery();
  
  ctx.reply(
    `🛍️ ${product.name}\n` +
    `💰 ${product.price} грн\n\n` +
    `Оберіть кількість:`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('1', `qty_${userId}_1`),
        Markup.button.callback('2', `qty_${userId}_2`),
        Markup.button.callback('3', `qty_${userId}_3`)
      ],
      [
        Markup.button.callback('4', `qty_${userId}_4`),
        Markup.button.callback('5', `qty_${userId}_5`)
      ]
    ])
  );
});

// Выбор количества
bot.action(/qty_(\d+)_(\d+)/, async (ctx) => {
  const userId = parseInt(ctx.match[1]);
  const qty = parseInt(ctx.match[2]);
  
  if (ctx.from.id !== userId) {
    return ctx.answerCbQuery('❌ Це не ваше замовлення');
  }
  
  const order = orders[userId];
  if (!order) {
    return ctx.answerCbQuery('❌ Помилка');
  }
  
  order.qty = qty;
  order.step = 'delivery';
  
  await ctx.answerCbQuery(`✅ ${qty} шт`);
  
  ctx.reply(
    `✅ Кількість: ${qty} шт\n\n` +
    `Оберіть доставку:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Нова Пошта', `del_${userId}_nova`)],
      [Markup.button.callback('📮 Укрпошта', `del_${userId}_ukr`)]
    ])
  );
});

// Выбор доставки
bot.action(/del_(\d+)_(nova|ukr)/, async (ctx) => {
  const userId = parseInt(ctx.match[1]);
  const delivery = ctx.match[2];
  
  if (ctx.from.id !== userId) return ctx.answerCbQuery('❌');
  
  const order = orders[userId];
  if (!order) return ctx.answerCbQuery('❌ Помилка');
  
  order.delivery = delivery;
  order.step = 'payment';
  
  await ctx.answerCbQuery();
  
  if (delivery === 'nova') {
    ctx.reply(
      '🚚 Нова Пошта\n\nОберіть оплату:',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 На картку', `pay_${userId}_card`)],
        [Markup.button.callback('💰 Накладений', `pay_${userId}_cod`)]
      ])
    );
  } else {
    order.payment = 'card';
    order.step = 'name';
    ctx.reply(
      '📮 Укрпошта\n' +
      '💳 Оплата: на картку\n\n' +
      'Введіть ПІБ:'
    );
  }
});

// Выбор оплаты
bot.action(/pay_(\d+)_(card|cod)/, async (ctx) => {
  const userId = parseInt(ctx.match[1]);
  const payment = ctx.match[2];
  
  if (ctx.from.id !== userId) return ctx.answerCbQuery('❌');
  
  const order = orders[userId];
  if (!order) return ctx.answerCbQuery('❌ Помилка');
  
  order.payment = payment;
  order.step = 'name';
  
  await ctx.answerCbQuery();
  ctx.reply('Введіть ПІБ отримувача:');
});

// Ввод текста
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const order = orders[userId];
  
  console.log(`[DEBUG] User ${userId}, text: "${text}", step: ${order ? order.step : 'no order'}`);
  
  if (!order) {
    console.log(`[DEBUG] No order for user ${userId}`);
    return;
  }
  
  // Проверяем текущий шаг
  if (order.step === 'name') {
    console.log(`[DEBUG] Processing name: ${text}`);
    order.name = text;
    order.step = 'phone';
    return ctx.reply('📱 Введіть номер телефону (0981234567):');
  }
  
  if (order.step === 'phone') {
    const phone = text.replace(/\D/g, '');
    if (!/^0\d{9}$/.test(phone)) {
      return ctx.reply('❌ Невірний формат. Введіть 0981234567:');
    }
    order.phone = phone;
    
    if (order.delivery === 'nova') {
      order.step = 'city';
      return ctx.reply('🏙 Введіть місто:');
    } else {
      order.step = 'index';
      return ctx.reply('📮 Введіть поштовий індекс:');
    }
  }
  
  if (order.step === 'city') {
    order.city = text;
    order.step = 'branch';
    return ctx.reply('📦 Введіть номер відділення Нової Пошти:');
  }
  
  if (order.step === 'branch') {
    order.branch = text;
    return finishOrder(ctx, userId);
  }
  
  if (order.step === 'index') {
    order.index = text;
    return finishOrder(ctx, userId);
  }
});

// Завершение заказа
function finishOrder(ctx, userId) {
  const order = orders[userId];
  const total = order.qty * order.product.price;
  const orderNum = Date.now().toString().slice(-6);
  
  console.log(`[LOG] Заказ #${orderNum} от ${userId}: ${order.product.name} x${order.qty}`);
  
  let msg = `✅ *Замовлення #${orderNum}*\n\n`;
  msg += `🛍️ ${order.product.name}\n`;
  msg += `📦 ${order.qty} шт × ${order.product.price} = ${total} грн\n`;
  
  if (order.delivery === 'nova') {
    msg += `🚚 Нова Пошта: ${order.city}, відд. ${order.branch}\n`;
  } else {
    msg += `📮 Укрпошта: індекс ${order.index}\n`;
  }
  
  if (order.payment === 'card') {
    msg += `💳 Оплата: на картку\n\n`;
    msg += `💵 *До оплати: ${total} грн*\n`;
    msg += '`Картка: ' + config.FOP_CARD_NUMBER + '`\n';
    msg += `*${config.FOP_NAME}*\n\n`;
    msg += `📎 В коментарі вкажіть: *Замовлення ${orderNum}*`;
  } else {
    const codTotal = total + 20 + Math.round(total * 0.02) + 100;
    msg += `💰 Оплата: накладений платіж\n`;
    msg += `   (комісія 20₴ + 2%)\n\n`;
    msg += `💵 *До оплати на пошті: ~${codTotal} грн*\n`;
    msg += `(товар ${total}₴ + доставка ~100₴ + комісія)`;
  }
  
  msg += `\n\n👤 ${order.name}\n`;
  msg += `📞 +38${order.phone}`;
  
  ctx.replyWithMarkdown(msg);
  
  // Уведомление админу
  if (config.ADMIN_CHAT_ID) {
    bot.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `🔔 Нове замовлення #${orderNum}\n\n` +
      `🛍️ ${order.product.name} x${order.qty}\n` +
      `💰 ${total} грн\n` +
      `👤 ${order.name}\n` +
      `📞 +38${order.phone}`
    ).catch(() => {});
  }
  
  // Удаляем заказ
  delete orders[userId];
}

// Запуск
console.log('✅ Бот готов к работе!');
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
