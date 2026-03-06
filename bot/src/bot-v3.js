const { Telegraf, Markup } = require('telegraf');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
const { getAIResponse } = require('./deepseekAI');

if (!config.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не задан!');
  process.exit(1);
}

const bot = new Telegraf(config.BOT_TOKEN);

// Хранилище заказов по user_id (работает между чатами)
const orders = new Map();

// Хранилище истории чата для AI
const aiChatHistory = new Map();

// ГЛОБАЛЬНЫЙ ЛОГ ВСЕГО
bot.use((ctx, next) => {
  console.log(`[DEBUG] Update type: ${ctx.updateType}, from: ${ctx.from?.id}, chat: ${ctx.chat?.id}`);
  if (ctx.message?.text) {
    console.log(`[DEBUG] Text: "${ctx.message.text}"`);
  }
  return next();
});

// Загрузка товаров
let products = {};
try {
  const ymlPath = path.join(__dirname, '../config/products.xml');
  if (fs.existsSync(ymlPath)) {
    const xml = fs.readFileSync(ymlPath, 'utf8');
    const offers = xml.match(/<offer[^\u003e]*>.*?\u003c\/offer\u003e/gs);
    if (offers) {
      offers.slice(0, 30).forEach(offer => {
        const id = offer.match(/id="(\d+)"/)?.[1];
        const name = offer.match(/<name\u003e([^\u003c]+)\u003c\/name\u003e/)?.[1];
        const price = offer.match(/<price\u003e(\d+)\u003c\/price\u003e/)?.[1];
        const avail = offer.match(/available="(true|false)"/)?.[1];
        if (id && name && price) {
          products[id] = { id, name, price: parseInt(price), inStock: avail !== 'false' };
        }
      });
    }
  }
} catch (e) {
  console.error('Ошибка загрузки товаров:', e.message);
}
console.log(`✅ Загружено ${Object.keys(products).length} товаров`);

// ========== AI ПОМОЩНИК (БАЗА ЗНАНИЙ) ==========
const knowledgeBase = {
  'степлер': {
    keywords: ['степлер', 'підв\'язка', 'виноград', 'такенер', 'підв\'язати', 'степлер для'],
    info: `📍 **Степлер для підв\'язки LOSSO Тапенер SC-8105**\n\n` +
          `✅ Призначення: підв\'язка винограду, дерев, кущів\n` +
          `✅ Швидкість: в 5-10 разів швидше за ручну підв\'язку\n` +
          `✅ Не пошкоджує стебла рослин\n` +
          `✅ Регульована ширина захоплення\n` +
          `✅ Матеріал: міцний пластик + метал\n\n` +
          `💰 Ціна: 650 грн\n` +
          `📦 В наявності`,
    usage: `📝 **Як користуватися:**\n\n` +
            `1. Вставте стрічку в степлер\n` +
            `2. Обхопіть стебло рослини\n` +
            `3. Натисніть ручку — скоба закріпить стрічку\n` +
            `4. Обріжте зайву довжину ножицями (в комплекті)\n\n` +
            `⚡ Економить час і сили!`
  },
  'годинник': {
    keywords: ['годинник', 'настільний', 'дзеркальний', 'будильник', 'час', 'температура'],
    info: `🕐 **Годинник електронний настільний LOSSO Premium**\n\n` +
          `✅ LED підсвічування (2 рівні яскравості)\n` +
          `✅ Будильник з функцією повтору (snooze)\n` +
          `✅ Термометр (відображення температури)\n` +
          `✅ Формати часу: 12/24 години\n` +
          `✅ Живлення: USB або 3xAAA батарейки\n` +
          `✅ Дзеркальна поверхня (можна використовувати для макіяжу)\n\n` +
          `💰 Ціна: 395 грн\n` +
          `📦 В наявності (білий, чорний)`,
    usage: `📝 **Налаштування:**\n\n` +
            `1. Зніміть захисну плівку з екрану\n` +
            `2. Підключіть USB або вставте батарейки\n` +
            `3. Тривале натискання SET — налаштування часу\n` +
            `4. Коротке натискання SET — перегляд температури\n\n` +
            `💡 При живленні від USB — підсвічування постійне`
  },
  'доставка': {
    keywords: ['доставка', 'нова пошта', 'укрпошта', 'коли прийде', 'терміни', 'сроки'],
    info: `🚚 **Доставка:**\n\n` +
          `• **Нова Пошта** — 1-3 дні по Україні\n` +
          `• **Укрпошта** — 3-7 днів\n\n` +
          `📦 Відправка:\n` +
          `• Пн-Пт: замовлення до 15:00 — відправка сьогодні\n` +
          `• Сб: замовлення до 12:00 — відправка сьогодні\n` +
          `• Нд: вихідний`,
    usage: null
  },
  'оплата': {
    keywords: ['оплата', 'оплатити', 'картка', 'накладений', 'готівка', 'оплата при отриманні'],
    info: `💳 **Способи оплати:**\n\n` +
          `1. **На картку** (повна передоплата)\n` +
          `   Картка: 4246001030247229\n` +
          `   ФОП Мандрика Т.С.\n\n` +
          `2. **Накладений платіж** (оплата при отриманні)\n` +
          `   + комісія Нової Пошти 20₴ + 2%\n\n` +
          `📱 Після оплати надішліть скріншот у цей чат`,
    usage: null
  },
  'гарантія': {
    keywords: ['гарантія', 'повернення', 'обмін', 'брак', 'не працює'],
    info: `🛡️ **Гарантія та повернення:**\n\n` +
          `✅ Гарантія: 6-12 місяців (залежно від товару)\n` +
          `✅ Обмін/повернення протягом 14 днів\n` +
          `✅ Якщо товар неналежної якості — заміна за наш рахунок\n\n` +
          `⚠️ Зверніть увагу: зняття захисної плівки з годинника означає втрату товарного вигляду`,
    usage: null
  }
};

// Функция поиска ответа AI
function findAnswer(question) {
  const q = question.toLowerCase();
  
  for (const [key, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(kw => q.includes(kw))) {
      return data;
    }
  }
  
  return null;
}

// Хранилище режима AI чата
const aiChatMode = new Set();

// ========== КОНЕЦ AI ПОМОЩНИКА ==========

// Главное меню
bot.command('start', (ctx) => {
  const userId = ctx.from.id;
  const payload = ctx.message.text.split(' ')[1]; // buy_PRODUCT_ID
  
  orders.delete(userId); // очистка
  
  // Якщо прийшов параметр buy_ — одразу починаємо замовлення
  if (payload && payload.startsWith('buy_')) {
    const productId = payload.replace('buy_', '');
    const product = products[productId] || { id: productId, name: 'Товар #' + productId, price: 0, inStock: false };
    
    if (!product.inStock || !product.price) {
      return ctx.reply('⚠️ Товар недоступний або закінчився');
    }
    
    // Сохраняем заказ
    orders.set(userId, { product, qty: 1, step: 'qty' });
    
    console.log(`[START] User ${userId} started order from deep link for ${product.name}`);
    
    return ctx.reply(
      `🛍️ ${product.name}\n💰 ${product.price} грн\n\nОберіть кількість:`,
      Markup.inlineKeyboard([
        [1,2,3].map(n => Markup.button.callback(`${n}`, `qty_${userId}_${n}`)),
        [4,5].map(n => Markup.button.callback(`${n}`, `qty_${userId}_${n}`))
      ])
    );
  }
  
  // Звичайний старт
  ctx.reply(
    '👋 Вітаємо у магазині LOSSO!\n\n' +
    'Я можу допомогти:\n' +
    '🛍️ Оформити замовлення\n' +
    '❓ Відповісти на питання про товари\n' +
    '📞 Зв\'язати з менеджером',
    Markup.keyboard([
      ['🛍️ Каталог', '❓ Питання про товар'],
      ['📞 Контакти', '📋 Замовлення'],
      ['👨‍💼 Зв\'язатися з менеджером']
    ]).resize()
  );
});

bot.hears('🛍️ Каталог', (ctx) => {
  ctx.reply('🛍️ Перейдіть у канал @losso_shop та натисніть «Купити» під товаром');
});

bot.hears('📞 Контакти', (ctx) => {
  ctx.reply('📞 @losso_shop\n⏰ Пн-Пт: 9:00-18:00, Сб: 10:00-17:00\n🚚 Відправка до 15:00 — сьогодні');
});

bot.hears('📋 Замовлення', (ctx) => {
  ctx.reply('📋 У вас поки немає замовлень.');
});

// ========== AI ПОМОЩНИК ==========
bot.hears('❓ Питання про товар', (ctx) => {
  const userId = ctx.from.id;
  aiChatMode.add(userId);
  ctx.reply(
    `🤖 *Я — AI помічник магазину LOSSO*\n\n` +
    `Можу відповісти на питання про:\n` +
    `• 📦 Товари (степлер, годинник і ін.)\n` +
    `• 🚚 Доставку та оплату\n` +
    `• 🛡️ Гарантію та повернення\n\n` +
    `❓ *Напишіть ваше питання:*`,
    { parse_mode: 'Markdown' }
  );
});

// AI чат-режим
bot.hears('👨‍💼 Зв\'язатися з менеджером', (ctx) => {
  const userId = ctx.from.id;
  aiChatMode.delete(userId); // выходим из AI режима
  
  ctx.reply(
    `👨‍💼 *Зв'язок з менеджером*\n\n` +
    `📞 Телефони:\n` +
    `(098) 040 25 00\n` +
    `(050) 040 25 00\n` +
    `(093) 040 25 00\n\n` +
    `📧 Email: lossotrade@gmail.com\n\n` +
    `⏰ Графік роботи:\n` +
    `Пн-Пт: 9:00-18:00\n` +
    `Сб: 10:00-17:00\n\n` +
    `✍️ Напишіть ваше питання тут — менеджер відповість найближчим часом.`
  );
  
  // Уведомление админу
  if (config.ADMIN_CHAT_ID) {
    ctx.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `🔔 Клієнт хоче зв'язатися з менеджером\n\n` +
      `👤 ${ctx.from.first_name || 'Клієнт'}\n` +
      `🆔 ID: ${userId}\n` +
      `👉 Напишіть йому у відповідь на це повідомлення`
    );
  }
});

// Обработка сообщений в AI режиме
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  // Если пользователь в режиме AI чата
  if (aiChatMode.has(userId)) {
    // Проверяем на команду выхода
    if (text === '/exit' || text === 'Вийти' || text === '⬅️ Назад') {
      aiChatMode.delete(userId);
      return ctx.reply(
        '👋 Вийшли з режиму питань.',
        Markup.keyboard([
          ['🛍️ Каталог', '❓ Питання про товар'],
          ['📞 Контакти', '📋 Замовлення'],
          ['👨‍💼 Зв\'язатися з менеджером']
        ]).resize()
      );
    }
    
    // DeepSeek AI интеграция
    ctx.reply('🤖 Думаю...').then(async (loadingMsg) => {
      try {
        // Получаем историю чата
        const history = aiChatHistory.get(userId) || [];
        
        // Запрашиваем ответ от DeepSeek
        const aiResponse = await getAIResponse(text, history);
        
        // Удаляем сообщение "Думаю..."
        ctx.deleteMessage(loadingMsg.message_id);
        
        // Сохраняем в историю
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: aiResponse.answer });
        // Храним последние 10 сообщений
        if (history.length > 20) history.shift();
        aiChatHistory.set(userId, history);
        
        // Отправляем ответ
        ctx.replyWithMarkdown(
          aiResponse.answer + '\n\n_Ще питання? Напишіть або натисніть 👨‍💼 для менеджера_ 🤝'
        );
        
      } catch (error) {
        console.error('[AI Error]:', error);
        ctx.deleteMessage(loadingMsg.message_id);
        ctx.reply('😔 Вибачте, сталася помилка. Спробуйте ще раз або зв\'яжіться з менеджером.');
      }
    });
    
    return; // Не передаем дальше
  }
  
  // ... остальной код обработки заказов
  const order = orders.get(userId);
  
  console.log(`[TEXT] User ${userId}: "${text}"`);
  console.log(`[TEXT] Order exists: ${!!order}, step: ${order?.step || 'none'}`);
  console.log(`[TEXT] AI mode: ${aiChatMode.has(userId)}`);
  console.log(`[TEXT] Orders count: ${orders.size}`);
  
  if (!order) {
    console.log(`[TEXT] No order for user ${userId}`);
    // Если нет заказа и не в AI режиме — можно дать подсказку
    if (!aiChatMode.has(userId)) {
      return; // Просто игнорируем
    }
    return;
  }
  
  console.log(`[TEXT] Order step: ${order.step}`);
  
  const step = order.step;
  
  // Шаг 1: ПІБ
  if (step === 'wait_name') {
    order.name = text;
    order.step = 'wait_phone';
    console.log(`[TEXT] User ${userId}: saved name, asking phone`);
    return ctx.reply('📱 Введіть номер телефону (0981234567):');
  }
  
  // Шаг 2: Телефон
  if (step === 'wait_phone') {
    const phone = text.replace(/\D/g, '');
    if (!/^0?\d{9}$/.test(phone)) {
      return ctx.reply('❌ Невірний формат. Введіть номер:');
    }
    order.phone = phone.startsWith('0') ? phone : '0' + phone;
    console.log(`[TEXT] User ${userId}: saved phone ${order.phone}`);
    
    if (order.delivery === 'nova') {
      order.step = 'wait_city';
      return ctx.reply('🏙 Введіть місто:');
    } else {
      order.step = 'wait_index';
      return ctx.reply('📮 Введіть поштовий індекс:');
    }
  }
  
  // Шаг 3а: Місто
  if (step === 'wait_city') {
    order.city = text;
    order.step = 'wait_branch';
    return ctx.reply('📦 Введіть номер відділення:');
  }
  
  // Шаг 3б: Відділення
  if (step === 'wait_branch') {
    order.branch = text;
    return finish(ctx, userId);
  }
  
  // Шаг 3в: Індекс
  if (step === 'wait_index') {
    order.index = text;
    return finish(ctx, userId);
  }
});

// Callback для связи с менеджером
bot.action('contact_manager', async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();
  
  // Вызываем тот же обработчик что и для кнопки
  ctx.reply(
    `👨‍💼 *Зв'язок з менеджером*\n\n` +
    `📞 Телефони:\n` +
    `(098) 040 25 00\n` +
    `(050) 040 25 00\n` +
    `(093) 040 25 00\n\n` +
    `📧 Email: lossotrade@gmail.com\n\n` +
    `⏰ Графік роботи:\n` +
    `Пн-Пт: 9:00-18:00\n` +
    `Сб: 10:00-17:00\n\n` +
    `✍️ Напишіть ваше питання тут — менеджер відповість найближчим часом.`
  );
  
  // Уведомление админу
  if (config.ADMIN_CHAT_ID) {
    ctx.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `🔔 Клієнт хоче зв'язатися з менеджером\n\n` +
      `👤 ${ctx.from.first_name || 'Клієнт'}\n` +
      `🆔 ID: ${userId}\n` +
      `👉 Напишіть йому у відповідь на це повідомлення`
    );
  }
});

// Кнопка Купити из канала
bot.action(/buy_(.+)/, async (ctx) => {
  const userId = ctx.from.id;
  const pid = ctx.match[1];
  const product = products[pid] || { id: pid, name: 'Товар #' + pid, price: 0, inStock: false };
  
  if (!product.inStock || !product.price) {
    return ctx.answerCbQuery('⚠️ Товар недоступний');
  }
  
  // Сохраняем заказ по user_id
  orders.set(userId, { product, qty: 1, step: 'qty' });
  
  console.log(`[ORDER] User ${userId} started order for ${product.name}`);
  
  await ctx.answerCbQuery();
  
  // ОТПРАВЛЯЕМ В ЛИЧКУ, НЕ В КАНАЛ
  try {
    await ctx.telegram.sendMessage(
      userId,
      `🛍️ ${product.name}\n💰 ${product.price} грн\n\nКількість:`,
      Markup.inlineKeyboard([
        [1,2,3].map(n => Markup.button.callback(`${n}`, `qty_${userId}_${n}`)),
        [4,5].map(n => Markup.button.callback(`${n}`, `qty_${userId}_${n}`))
      ])
    );
    console.log(`[ORDER] Message sent to user ${userId}`);
    // Показываем уведомление что нужно смотреть личку
    ctx.answerCbQuery('✅ Перевірте особисті повідомлення!', { show_alert: true });
  } catch (err) {
    console.error(`[ORDER] Failed to send message to ${userId}:`, err.message);
    // Показываем попап пользователю, не пишем в канал
    ctx.answerCbQuery('⚠️ Спочатку натисніть /start у боті @losso_shop_bot', { show_alert: true });
  }
});

// Количество
bot.action(/qty_(\d+)_(\d)/, async (ctx) => {
  const userId = parseInt(ctx.match[1]);
  const qty = parseInt(ctx.match[2]);
  
  if (ctx.from.id !== userId) return ctx.answerCbQuery('❌');
  
  const order = orders.get(userId);
  if (!order) return ctx.answerCbQuery('Помилка');
  
  order.qty = qty;
  order.step = 'delivery';
  
  await ctx.answerCbQuery(`✅ ${qty} шт`);
  
  // В ЛИЧКУ
  ctx.telegram.sendMessage(
    userId,
    `✅ ${qty} шт\n\nДоставка:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Нова Пошта', `del_${userId}_nova`)],
      [Markup.button.callback('📮 Укрпошта', `del_${userId}_ukr`)]
    ])
  );
});

// Доставка
bot.action(/del_(\d+)_(nova|ukr)/, async (ctx) => {
  const userId = parseInt(ctx.match[1]);
  const delivery = ctx.match[2];
  
  if (ctx.from.id !== userId) return ctx.answerCbQuery('❌');
  
  const order = orders.get(userId);
  if (!order) return ctx.answerCbQuery('Помилка');
  
  order.delivery = delivery;
  
  await ctx.answerCbQuery();
  
  if (delivery === 'nova') {
    order.step = 'payment';
    // В ЛИЧКУ
    ctx.telegram.sendMessage(
      userId,
      '🚚 Нова Пошта\n\nОплата:',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 На картку', `pay_${userId}_card`)],
        [Markup.button.callback('💰 Накладений', `pay_${userId}_cod`)]
      ])
    );
  } else {
    order.payment = 'card';
    order.step = 'wait_name';
    // В ЛИЧКУ
    ctx.telegram.sendMessage(userId, '📮 Укрпошта (оплата на картку)\n\n✏️ Введіть ПІБ:');
  }
});

// Оплата
bot.action(/pay_(\d+)_(card|cod)/, async (ctx) => {
  const userId = parseInt(ctx.match[1]);
  const payment = ctx.match[2];
  
  if (ctx.from.id !== userId) return ctx.answerCbQuery('❌');
  
  const order = orders.get(userId);
  if (!order) return ctx.answerCbQuery('Помилка');
  
  order.payment = payment;
  order.step = 'wait_name';
  
  await ctx.answerCbQuery();
  // В ЛИЧКУ
  ctx.telegram.sendMessage(userId, '✏️ Введіть ПІБ отримувача:');
});

// ВВОД ТЕКСТА
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  console.log(`[TEXT] ========`);
  console.log(`[TEXT] User ID: ${userId}`);
  console.log(`[TEXT] Text: "${text}"`);
  console.log(`[TEXT] Orders: ${Array.from(orders.keys()).join(', ') || 'none'}`);
  
  const order = orders.get(userId);
  
  if (!order) {
    console.log(`[TEXT] No order for user ${userId}`);
    return ctx.reply('⚠️ У вас немає активного замовлення. Перейдіть у канал @losso_shop');
  }
  
  console.log(`[TEXT] Order step: ${order.step}`);
  
  const step = order.step;
  
  // Шаг 1: ПІБ
  if (step === 'wait_name') {
    order.name = text;
    order.step = 'wait_phone';
    console.log(`[TEXT] User ${userId}: saved name, asking phone`);
    return ctx.reply('📱 Введіть номер телефону (0981234567):');
  }
  
  // Шаг 2: Телефон
  if (step === 'wait_phone') {
    const phone = text.replace(/\D/g, '');
    if (!/^0?\d{9}$/.test(phone)) {
      return ctx.reply('❌ Невірний формат. Введіть номер:');
    }
    order.phone = phone.startsWith('0') ? phone : '0' + phone;
    console.log(`[TEXT] User ${userId}: saved phone ${order.phone}`);
    
    if (order.delivery === 'nova') {
      order.step = 'wait_city';
      return ctx.reply('🏙 Введіть місто:');
    } else {
      order.step = 'wait_index';
      return ctx.reply('📮 Введіть поштовий індекс:');
    }
  }
  
  // Шаг 3а: Місто
  if (step === 'wait_city') {
    order.city = text;
    order.step = 'wait_branch';
    return ctx.reply('📦 Введіть номер відділення:');
  }
  
  // Шаг 3б: Відділення
  if (step === 'wait_branch') {
    order.branch = text;
    return finish(ctx, userId);
  }
  
  // Шаг 3в: Індекс
  if (step === 'wait_index') {
    order.index = text;
    return finish(ctx, userId);
  }
});

// Кнопка "Отправить скриншот"
bot.action('send_screenshot', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('📷 Надішліть фото або файл зі скріншотом оплати:');
});

// Прием фото (скриншот оплаты)
bot.on('photo', (ctx) => {
  const userId = ctx.from.id;
  
  // Пересылаем админу
  if (config.ADMIN_CHAT_ID) {
    ctx.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `📷 Скріншот оплати від ${ctx.from.username || ctx.from.first_name} (ID: ${userId})`
    );
    ctx.forwardMessage(config.ADMIN_CHAT_ID);
    ctx.reply('✅ Дякуємо! Скріншот отримано. Ми перевіримо оплату та надішлемо підтвердження.');
  } else {
    ctx.reply('✅ Дякуємо! Скріншот отримано.');
  }
});

// Прием документа (файл)
bot.on('document', (ctx) => {
  const userId = ctx.from.id;
  
  if (config.ADMIN_CHAT_ID) {
    ctx.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `📄 Файл від ${ctx.from.username || ctx.from.first_name} (ID: ${userId})`
    );
    ctx.forwardMessage(config.ADMIN_CHAT_ID);
    ctx.reply('✅ Дякуємо! Файл отримано.');
  } else {
    ctx.reply('✅ Дякуємо! Файл отримано.');
  }
});

// Обработка кнопок админа
bot.action(/paid_(.+)/, async (ctx) => {
  const orderNum = ctx.match[1];
  await ctx.answerCbQuery('✅ Позначено як оплачено');
  ctx.reply(`✅ Замовлення #${orderNum} позначено як ОПЛАЧЕНО`);
  // TODO: Отправить уведомление клиенту
});

bot.action(/sent_(.+)/, async (ctx) => {
  const orderNum = ctx.match[1];
  await ctx.answerCbQuery('📦 Позначено як відправлено');
  ctx.reply(`📦 Замовлення #${orderNum} позначено як ВІДПРАВЛЕНО`);
  // TODO: Отправить трек-номер клиенту
});

// Финиш
function finish(ctx, userId) {
  const o = orders.get(userId);
  if (!o) {
    console.log(`[FINISH] Order already finished for user ${userId}`);
    return; // Уже завершён
  }
  
  // Удаляем заказ СРАЗУ, до отправки сообщений
  orders.delete(userId);
  console.log(`[FINISH] Finishing order for user ${userId}`);
  
  const total = o.qty * o.product.price;
  const num = Date.now().toString().slice(-6);
  
  // Сохраняем номер заказа для дальнейшего
  o.orderNum = num;
  
  if (o.payment === 'card') {
    // Оплата картой - новый формат
    let msg = `✅ *Замовлення #${num}*\n\n`;
    msg += `🛍️ ${o.product.name}\n`;
    msg += `📦 ${o.qty} шт × ${o.product.price} = *${total} грн*\n`;
    
    if (o.delivery === 'nova') {
      msg += `🚚 Нова Пошта: ${o.city}, відд. ${o.branch}\n\n`;
    } else {
      msg += `📮 Укрпошта: ${o.index}\n\n`;
    }
    
    msg += `💳 *Картка для оплати:*\n`;
    msg += "`4246001030247229`\n";
    msg += `*ФОП Мандрика Т.С.*\n`;
    msg += `*${total} грн*\n\n`;
    msg += `📎 *При оплаті вказуйте:* Замовлення #${num}\n\n`;
    msg += `✉️ *Пришліть скріншот після оплати, будь ласка*\n\n`;
    msg += `З повагою, команда LOSSO\n`;
    msg += `📞 (098) 040 25 00\n`;
    msg += `📞 (050) 040 25 00\n`;
    msg += `📞 (093) 040 25 00\n`;
    msg += `📧 lossotrade@gmail.com`;
    
    ctx.replyWithMarkdown(msg);
    
    // Кнопка для отправки скриншота
    setTimeout(() => {
      ctx.reply(
        '📎 Натисніть кнопку нижче, щоб надіслати скріншот оплати:',
        Markup.inlineKeyboard([
          [Markup.button.callback('📷 Надіслати скріншот', 'send_screenshot')]
        ])
      );
    }, 500);
    
  } else {
    // Накладенный платеж
    const cod = total + 20 + Math.round(total * 0.02) + 100;
    let msg = `✅ *Замовлення #${num}*\n\n`;
    msg += `🛍️ ${o.product.name}\n`;
    msg += `📦 ${o.qty} шт × ${o.product.price} = *${total} грн*\n`;
    
    if (o.delivery === 'nova') {
      msg += `🚚 Нова Пошта: ${o.city}, відд. ${o.branch}\n\n`;
    } else {
      msg += `📮 Укрпошта: ${o.index}\n\n`;
    }
    
    msg += `💰 *Накладений платіж*\n`;
    msg += `💵 *До оплати на пошті: ~${cod} грн*\n`;
    msg += `(товар ${total}₴ + доставка ~100₴ + комісія 20₴ + 2%)\n\n`;
    msg += `👤 ${o.name}\n`;
    msg += `📞 +38${o.phone}\n\n`;
    msg += `З повагою, команда LOSSO`;
    
    ctx.replyWithMarkdown(msg);
  }
  
  // Уведомление админу
  if (config.ADMIN_CHAT_ID) {
    ctx.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `🔔 Нове замовлення #${num}\n\n` +
      `🛍️ ${o.product.name} x${o.qty}\n` +
      `💰 ${total} грн (${o.payment === 'card' ? 'картка' : 'накладений'})\n` +
      `👤 ${o.name}\n` +
      `📞 +38${o.phone}\n` +
      `${o.delivery === 'nova' ? `🚚 ${o.city}, відд. ${o.branch}` : `📮 ${o.index}`}`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Оплачено', `paid_${num}`)],
        [Markup.button.callback('📦 Відправлено', `sent_${num}`)]
      ])
    ).catch(() => {});
  }
}

console.log('🚀 Бот LOSSO запущений!');
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
