const { Telegraf, Markup } = require('telegraf');
const config = require('../config/config');
const { calculateOrderTotal } = require('./utils/calculator');

// Проверка конфигурации
if (!config.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не задан!');
  process.exit(1);
}

const bot = new Telegraf(config.BOT_TOKEN);

// Хранилище состояний пользователей
const userStates = new Map();

// ==================== КОМАНДЫ ====================

// Старт
bot.command('start', (ctx) => {
  const payload = ctx.payload; // Данные из deep link (например, ID товара)
  
  ctx.reply(
    `Вітаємо у магазині LOSSO! 🏠\n\n` +
    `У нас ви знайдете якісні товари для дому з доставкою по всій Україні.`,
    Markup.keyboard([
      ['🛍️ Каталог товарів', '❓ Допомога'],
      ['📞 Контакти', '📋 Мої замовлення']
    ]).resize()
  );
  
  // Если пришли из канала с товаром
  if (payload) {
    handleProductSelection(ctx, payload);
  }
});

// Помощь
bot.hears('❓ Допомога', (ctx) => {
  ctx.reply(
    `Як оформити замовлення?\n\n` +
    `1️⃣ Оберіть товар у каналі @losso_shop\n` +
    `2️⃣ Натисніть кнопку «Купити»\n` +
    `3️⃣ Вкажіть кількість та дані для доставки\n` +
    `4️⃣ Оплатіть замовлення\n` +
    `5️⃣ Отримайте трек-номер\n\n` +
    `💬 З питань звертайтесь: @losso_support`
  );
});

// Контакты
bot.hears('📞 Контакти', (ctx) => {
  ctx.reply(
    `📞 Контакти магазину LOSSO\n\n` +
    `• Канал: @losso_shop\n` +
    `• Підтримка: @losso_support\n\n` +
    `⏰ Графік роботи:\n` +
    `Пн-Пт: 09:00-18:00\n` +
    `Сб-Нд: 10:00-15:00\n` +
    `Нд: вихідний\n\n` +
    `🚚 Відправка:\n` +
    `• Замовлення до 15:00 — відправка сьогодні\n` +
    `• Після 15:00 — відправка завтра`
  );
});

// Каталог товарів
bot.hears('🛍️ Каталог товарів', (ctx) => {
  ctx.reply(
    `🛍️ Наші товари доступні в каналі:\n\n` +
    `@losso_shop\n\n` +
    `Натисніть кнопку «Купити» під товаром, щоб оформити замовлення.`,
    Markup.inlineKeyboard([
      Markup.button.url('📱 Перейти в канал', 'https://t.me/losso_shop')
    ])
  );
});

// Мої замовлення
bot.hears('📋 Мої замовлення', (ctx) => {
  // Пока заглушка - в будущем подключить базу данных
  ctx.reply(
    `📋 Ваші замовлення\n\n` +
    `У вас поки немає активних замовлень.\n\n` +
    `Перейдіть в канал @losso_shop, щоб зробити перше замовлення!`,
    Markup.inlineKeyboard([
      Markup.button.url('🛍️ Перейти до покупок', 'https://t.me/losso_shop')
    ])
  );
});

// ==================== ОФОРМЛЕНИЕ ЗАКАЗА ====================

// Обработка нажатия "Купить" из канала
bot.action(/buy_(.+)/, async (ctx) => {
  const productId = ctx.match[1];
  await ctx.answerCbQuery();
  
  // Получаем информацию о товаре (пока заглушка)
  const product = await getProduct(productId);
  
  if (!product.inStock) {
    return ctx.reply('⚠️ На жаль, цей товар закінчився');
  }
  
  // Сохраняем состояние
  userStates.set(ctx.from.id, {
    step: 'quantity',
    product: product,
    order: { productId, quantity: 1 },
    lastUpdate: Date.now()
  });
  
  ctx.reply(
    `🛍️ ${product.name}\n` +
    `💰 Ціна: ${product.price} грн\n\n` +
    `Оберіть кількість:`,
    Markup.inlineKeyboard([
      [1, 2, 3, 4, 5].map(n => Markup.button.callback(`${n} шт`, `qty_${n}`)),
      [Markup.button.callback('Інша кількість', 'qty_custom')]
    ])
  );
});

// Выбор количества
bot.action(/qty_(.+)/, async (ctx) => {
  const qty = ctx.match[1];
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  
  if (!state) {
    return ctx.reply('❌ Сесія закінчилася. Почніть спочатку з каналу.');
  }
  
  await ctx.answerCbQuery();
  
  if (qty === 'custom') {
    state.step = 'quantity_custom';
    return ctx.reply('Введіть потрібну кількість:');
  }
  
  state.order.quantity = parseInt(qty);
  state.step = 'delivery';
  state.lastUpdate = Date.now();
  
  ctx.reply(
    `✅ Кількість: ${qty} шт\n\n` +
    `Оберіть спосіб доставки:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Нова Пошта', 'delivery_nova')],
      [Markup.button.callback('📮 Укрпошта', 'delivery_ukr')]
    ])
  );
});

// Выбор доставки
bot.action(/delivery_(.+)/, async (ctx) => {
  const delivery = ctx.match[1];
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  
  if (!state) {
    return ctx.reply('❌ Сесія закінчилася. Почніть спочатку з каналу.');
  }
  
  await ctx.answerCbQuery();
  
  state.order.delivery = delivery;
  state.step = 'payment';
  state.lastUpdate = Date.now();
  
  if (delivery === 'nova') {
    ctx.reply(
      `🚚 Нова Пошта\n\n` +
      `Оберіть спосіб оплати:`,
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 Повна оплата на картку', 'payment_card')],
        [Markup.button.callback('💰 Накладений платіж', 'payment_cod')]
      ])
    );
  } else {
    // Укрпошта - только полная оплата
    state.order.payment = 'card';
    state.step = 'data_pib';
    ctx.reply(
      `📮 Укрпошта\n\n` +
      `💳 Спосіб оплати: Повна оплата на картку\n\n` +
      `Введіть ПІБ отримувача:`
    );
  }
});

// Выбор оплаты
bot.action(/payment_(.+)/, async (ctx) => {
  const payment = ctx.match[1];
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  
  if (!state) {
    return ctx.reply('❌ Сесія закінчилася. Почніть спочатку з каналу.');
  }
  
  await ctx.answerCbQuery();
  
  state.order.payment = payment;
  state.step = 'data_pib';
  state.lastUpdate = Date.now();
  
  ctx.reply('Введіть ПІБ отримувача:');
});

// Сбор данных клиента
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  
  console.log(`[DEBUG] User ${userId}, text: ${ctx.message.text}, state:`, state ? state.step : 'null');
  
  if (!state) {
    console.log(`[DEBUG] No state for user ${userId}`);
    return;
  }
  
  const text = ctx.message.text;
  
  switch (state.step) {
    case 'quantity_custom':
      const qty = parseInt(text);
      if (isNaN(qty) || qty < 1) {
        return ctx.reply('❌ Введіть коректне число');
      }
      state.order.quantity = qty;
      state.step = 'delivery';
      state.lastUpdate = Date.now();
      return ctx.reply(
        `✅ Кількість: ${qty} шт\n\nОберіть спосіб доставки:`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🚚 Нова Пошта', 'delivery_nova')],
          [Markup.button.callback('📮 Укрпошта', 'delivery_ukr')]
        ])
      );
      
    case 'data_pib':
      state.order.pib = text;
      state.step = 'data_phone';
      state.lastUpdate = Date.now();
      return ctx.reply('Введіть номер телефону (наприклад, 0981234567):');
      
    case 'data_phone':
      if (!/^0\d{9}$/.test(text.replace(/\D/g, ''))) {
        return ctx.reply('❌ Невірний формат. Введіть номер у форматі 0981234567');
      }
      state.order.phone = text.replace(/\D/g, '');
      state.lastUpdate = Date.now();
      
      if (state.order.delivery === 'nova') {
        state.step = 'data_city';
        return ctx.reply('Введіть місто доставки:');
      } else {
        state.step = 'data_index';
        return ctx.reply('Введіть поштовий індекс:');
      }
      
    case 'data_city':
      state.order.city = text;
      state.step = 'data_branch';
      state.lastUpdate = Date.now();
      return ctx.reply('Введіть номер відділення Нової Пошти:');
      
    case 'data_branch':
      state.order.branch = text;
      state.lastUpdate = Date.now();
      return showOrderSummary(ctx, userId);
      
    case 'data_index':
      state.order.index = text;
      state.lastUpdate = Date.now();
      return showOrderSummary(ctx, userId);
  }
});

// Показать сводку заказа
async function showOrderSummary(ctx, userId) {
  const state = userStates.get(userId);
  const order = state.order;
  const product = state.product;
  
  const calculation = calculateOrderTotal(order, product);
  
  let summary = `📋 Підтвердження замовлення\n\n`;
  summary += `🛍️ Товар: ${product.name}\n`;
  summary += `📦 Кількість: ${order.quantity} шт\n`;
  summary += `💰 Товар: ${calculation.productTotal} грн\n\n`;
  
  if (order.delivery === 'nova') {
    summary += `🚚 Доставка: Нова Пошта\n`;
    summary += `   📍 ${order.city}, відд. ${order.branch}\n`;
    if (order.payment === 'card') {
      summary += `💳 Оплата: Повна на картку\n`;
      summary += `   🚚 Доставка: ~85-115₴ (при отриманні)\n\n`;
      summary += `💵 До оплати зараз: ${calculation.productTotal} грн\n`;
      summary += `💵 На пошті: ~85-115₴ за доставку`;
    } else {
      summary += `💰 Оплата: Накладений платіж\n`;
      summary += `   💸 Комісія: 20₴ + 2%\n`;
      summary += `   🚚 Доставка: ~85-115₴\n\n`;
      summary += `💵 До оплати на пошті: ~${calculation.codTotal} грн`;
    }
  } else {
    summary += `📮 Доставка: Укрпошта\n`;
    summary += `   📍 Індекс: ${order.index}\n`;
    summary += `💳 Оплата: Повна на картку\n`;
    summary += `   🚚 Доставка: ~50-70₴ (при отриманні)\n\n`;
    summary += `💵 До оплати зараз: ${calculation.productTotal} грн`;
  }
  
  summary += `\n\n👤 ${order.pib}\n`;
  summary += `📞 ${order.phone}`;
  
  state.step = 'confirm';
  
  ctx.reply(summary, Markup.inlineKeyboard([
    [Markup.button.callback('✅ Підтвердити замовлення', 'confirm_order')],
    [Markup.button.callback('❌ Скасувати', 'cancel_order')]
  ]));
}

// Подтверждение заказа
bot.action('confirm_order', async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  
  await ctx.answerCbQuery('✅ Замовлення прийнято!');
  
  // Здесь будет создание заказа в SalesDrive
  // const orderId = await createOrderInSalesDrive(state.order);
  
  let response = `✅ Замовлення #${Date.now().toString().slice(-6)} прийнято!\n\n`;
  
  if (state.order.payment === 'card') {
    response += `💳 Для оплати перерахуйте ${state.order.quantity * state.product.price} грн на картку:\n`;
    response += `\`${config.FOP_CARD_NUMBER}\`\n`;
    response += `${config.FOP_NAME}\n\n`;
    response += `Після оплати надішліть скріншот у цей чат 📸`;
  } else {
    response += `💰 Ви обрали накладений платіж\n`;
    response += `Замовлення буде відправлено найближчим часом 📦`;
  }
  
  response += `\n\n${getShippingMessage()}`;
  
  // Уведомление админу
  notifyAdmin(state);
  
  ctx.reply(response, { parse_mode: 'Markdown' });
  userStates.delete(userId);
});

// Отмена заказа
bot.action('cancel_order', async (ctx) => {
  await ctx.answerCbQuery('❌ Скасовано');
  userStates.delete(ctx.from.id);
  ctx.reply('Замовлення скасовано. Спробуйте ще раз або зверніться у підтримку @losso_support');
});

// ==================== УТИЛИТЫ ====================

function getShippingMessage() {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 14) {
    return '⏰ Ваше замовлення буде відправлено сьогодні до 15:00 📦';
  } else {
    return '⏰ Ваше замовлення буде відправлено завтра 📦';
  }
}

async function getProduct(productId) {
  // Заглушка - здесь будет запрос к базе/CSV
  return {
    id: productId,
    name: 'Тестовий товар LOSSO',
    price: 625,
    inStock: true,
    stockCount: 10
  };
}

async function notifyAdmin(state) {
  try {
    const order = state.order;
    const product = state.product;
    
    let message = `🆕 Нове замовлення!\n\n`;
    message += `🛍️ ${product.name} x${order.quantity}\n`;
    message += `💰 ${order.quantity * product.price} грн\n`;
    message += `🚚 ${order.delivery === 'nova' ? 'Нова Пошта' : 'Укрпошта'}\n`;
    message += `💳 ${order.payment === 'card' ? 'На картку' : 'Накладений'}\n`;
    message += `\n👤 ${order.pib}\n`;
    message += `📞 ${order.phone}\n`;
    
    if (order.city) message += `📍 ${order.city}, відд. ${order.branch}\n`;
    if (order.index) message += `📍 Індекс: ${order.index}\n`;
    
    await bot.telegram.sendMessage(config.ADMIN_CHAT_ID, message);
  } catch (e) {
    console.error('Failed to notify admin:', e);
  }
}

// ==================== ГОЛОСОВЫЕ СООБЩЕНИЯ ====================

bot.on('voice', async (ctx) => {
  const userId = ctx.from.id;
  const voice = ctx.message.voice;
  
  console.log(`🎙️ Получено голосовое от ${userId}, длительность: ${voice.duration}с`);
  
  // Показываем что обрабатываем
  const processingMsg = await ctx.reply('🎙️ Розпізнаю голосове повідомлення...');
  
  try {
    // Создаем директорию для временных файлов
    const tempDir = '/tmp/losso-bot-voice';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Скачиваем файл
    const fileLink = await ctx.telegram.getFileLink(voice.file_id);
    const oggPath = path.join(tempDir, `voice_${userId}_${Date.now()}.ogg`);
    
    const response = await fetch(fileLink);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(oggPath, buffer);
    
    // Распознаем через Whisper
    const result = await transcribeAudio(oggPath, {
      model: 'base',  // можно 'small' для лучшего качества
      language: 'uk'  // украинский
    });
    
    // Удаляем сообщение "обработка"
    await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    
    if (result.success && result.text) {
      // Показываем распознанный текст
      await ctx.reply(`📝 *Розпізнано:*\n_${result.text}_`, { parse_mode: 'Markdown' });
      
      // Анализируем текст как заказ (простая логика)
      const orderInfo = parseVoiceOrder(result.text);
      
      if (orderInfo.isOrder) {
        await ctx.reply(
          `🔍 Схоже, ви хочете зробити замовлення!\n\n` +
          `📦 Товар: ${orderInfo.product || 'Невідомо'}\n` +
          `📊 Кількість: ${orderInfo.quantity || 1} шт\n\n` +
          `Відкриваю оформлення замовлення...`,
          Markup.inlineKeyboard([
            [Markup.button.callback('✅ Продовжити', 'start_voice_order')]
          ])
        );
        
        // Сохраняем во временное состояние
        await setState(userId, 'voice_order', {
          text: result.text,
          parsed: orderInfo
        }, {});
      } else {
        await ctx.reply(
          `❓ Я почув: "${result.text}"\n\n` +
          `Якщо це замовлення — перейдіть у канал @losso_shop та оберіть товар. ` +
          `Або напишіть текстом що вам потрібно!`
        );
      }
    } else {
      await ctx.reply('❌ Не вдалося розпізнати голосове повідомлення. Спробуйте написати текстом.');
    }
    
    // Очистка
    try { fs.unlinkSync(oggPath); } catch (e) {}
    
  } catch (error) {
    console.error('❌ Ошибка обработки голосового:', error);
    await ctx.reply('❌ Помилка обробки голосового. Спробуйте написати текстом.');
  }
});

// Обработка заказа из голосового
bot.action('start_voice_order', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from.id;
  const state = await getState(userId);
  
  if (!state || !state.order.parsed) {
    return ctx.reply('❌ Дані не знайдено. Спробуйте ще раз.');
  }
  
  ctx.reply(
    `🎙️ Замовлення з голосового:\n\n` +
    `Текст: "${state.order.text}"\n\n` +
    `Поки що я вчуся розпізнавати голосові замовлення точніше. ` +
    `Краще оформлюйте замовлення через кнопку «Купити» у каналі! 🛒`
  );
  
  // Очищаем состояние
  await clearState(userId);
});

// Простой парсер голосовых заказов
function parseVoiceOrder(text) {
  const lowerText = text.toLowerCase();
  
  // Признаки заказа
  const orderWords = ['хочу', 'замовити', 'купити', 'потрібно', 'давай', 'візьму'];
  const isOrder = orderWords.some(word => lowerText.includes(word));
  
  // Поиск количества
  const quantityMatch = text.match(/(\d+)\s*(шт|штук|штуки|порцій|кг|грам|метрів)?/);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
  
  // Извлечение названия товара (простая эвристика)
  let product = null;
  if (isOrder) {
    // Убираем слова-заказы и берем остальное
    const cleanText = text.replace(/хочу|замовити|купити|потрібно|давай|візьму/gi, '').trim();
    if (cleanText.length > 3) {
      product = cleanText.substring(0, 50); // ограничиваем длину
    }
  }
  
  return { isOrder, quantity, product };
}

// ==================== ЗАПУСК ====================

bot.launch()
  .then(() => console.log('✅ Бот LOSSO запущений!'))
  .catch(err => console.error('❌ Помилка запуску:', err));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
