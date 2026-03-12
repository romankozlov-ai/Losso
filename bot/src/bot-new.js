const { Telegraf, Markup, session } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// Проверка конфига
if (!config.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не задан!');
  process.exit(1);
}

const bot = new Telegraf(config.BOT_TOKEN);

// Сессии
bot.use(new LocalSession({ database: 'sessions.json' }).middleware());

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

// Главное меню
bot.command('start', (ctx) => {
  ctx.session = {}; // очистка
  ctx.reply(
    '👋 Вітаємо у магазині LOSSO!',
    Markup.keyboard([['🛍️ Каталог', '❓ Допомога'], ['📞 Контакти', '📋 Замовлення']]).resize()
  );
});

bot.hears('🛍️ Каталог', (ctx) => {
  ctx.reply('🛍️ Перейдіть у канал @losso_shop та натисніть «Купити» під товаром');
});

bot.hears('❓ Допомога', (ctx) => {
  ctx.reply('Як замовити:\n1️⃣ Оберіть товар\n2️⃣ Натисніть «Купити»\n3️⃣ Вкажіть дані\n4️⃣ Оплатіть\n5️⃣ Отримайте трек');
});

bot.hears('📞 Контакти', (ctx) => {
  ctx.reply('📞 @losso_shop\n⏰ Пн-Пт: 9:00-18:00, Сб-Нд: 10:00-15:00\n🚚 Відправка до 15:00 — сьогодні');
});

bot.hears('📋 Замовлення', (ctx) => {
  ctx.reply('📋 У вас поки немає замовлень.');
});

// Кнопка Купити
bot.action(/buy_(.+)/, async (ctx) => {
  const pid = ctx.match[1];
  const product = products[pid] || { id: pid, name: 'Товар #' + pid, price: 0, inStock: false };
  
  if (!product.inStock || !product.price) {
    return ctx.answerCbQuery('⚠️ Товар недоступний');
  }
  
  ctx.session.order = { product, qty: 1, step: 'qty' };
  
  await ctx.answerCbQuery();
  ctx.reply(
    `🛍️ ${product.name}\n💰 ${product.price} грн\n\nКількість:`,
    Markup.inlineKeyboard([
      [1,2,3].map(n => Markup.button.callback(`${n}`, `qty_${n}`)),
      [4,5].map(n => Markup.button.callback(`${n}`, `qty_${n}`))
    ])
  );
});

// Количество
bot.action(/qty_(\d)/, async (ctx) => {
  if (!ctx.session.order) return ctx.answerCbQuery('Помилка');
  
  ctx.session.order.qty = parseInt(ctx.match[1]);
  ctx.session.order.step = 'delivery';
  
  await ctx.answerCbQuery();
  ctx.reply(
    `✅ ${ctx.session.order.qty} шт\n\nДоставка:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🚚 Нова Пошта', 'del_nova')],
      [Markup.button.callback('📮 Укрпошта', 'del_ukr')]
    ])
  );
});

// Доставка
bot.action(/del_(nova|ukr)/, async (ctx) => {
  if (!ctx.session.order) return ctx.answerCbQuery('Помилка');
  
  const delivery = ctx.match[1];
  ctx.session.order.delivery = delivery;
  
  await ctx.answerCbQuery();
  
  if (delivery === 'nova') {
    ctx.session.order.step = 'payment';
    ctx.reply(
      '🚚 Нова Пошта\n\nОплата:',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 На картку', 'pay_card')],
        [Markup.button.callback('💰 Накладений', 'pay_cod')]
      ])
    );
  } else {
    ctx.session.order.payment = 'card';
    ctx.session.order.step = 'wait_name';
    ctx.reply('📮 Укрпошта (оплата на картку)\n\n✏️ Введіть ПІБ:');
  }
});

// Оплата
bot.action(/pay_(card|cod)/, async (ctx) => {
  if (!ctx.session.order) return ctx.answerCbQuery('Помилка');
  
  ctx.session.order.payment = ctx.match[1];
  ctx.session.order.step = 'wait_name';
  
  await ctx.answerCbQuery();
  ctx.reply('✏️ Введіть ПІБ отримувача:');
});

// ВВОД ТЕКСТА — все шаги
bot.on('text', (ctx) => {
  const text = ctx.message.text;
  const order = ctx.session?.order;
  
  console.log(`[DEBUG] Text: "${text}", hasOrder: ${!!order}, step: ${order?.step || 'none'}`);
  
  if (!order) {
    console.log('[DEBUG] No order in session');
    return; // не в процессе заказа
  }
  
  const step = order.step;
  
  // Шаг 1: ПІБ
  if (step === 'wait_name') {
    order.name = text;
    order.step = 'wait_phone';
    return ctx.reply('📱 Введіть номер телефону:');
  }
  
  // Шаг 2: Телефон
  if (step === 'wait_phone') {
    const phone = text.replace(/\D/g, '');
    if (!/^0?\d{9}$/.test(phone)) {
      return ctx.reply('❌ Невірний формат. Введіть номер:');
    }
    order.phone = phone.startsWith('0') ? phone : '0' + phone;
    
    if (order.delivery === 'nova') {
      order.step = 'wait_city';
      return ctx.reply('🏙 Введіть місто:');
    } else {
      order.step = 'wait_index';
      return ctx.reply('📮 Введіть поштовий індекс:');
    }
  }
  
  // Шаг 3а: Місто (Нова Пошта)
  if (step === 'wait_city') {
    order.city = text;
    order.step = 'wait_branch';
    return ctx.reply('📦 Введіть номер відділення:');
  }
  
  // Шаг 3б: Відділення (Нова Пошта)
  if (step === 'wait_branch') {
    order.branch = text;
    return finish(ctx);
  }
  
  // Шаг 3в: Індекс (Укрпошта)
  if (step === 'wait_index') {
    order.index = text;
    return finish(ctx);
  }
});

// Финиш
function finish(ctx) {
  const o = ctx.session.order;
  const total = o.qty * o.product.price;
  const num = Date.now().toString().slice(-6);
  
  let msg = `✅ *Замовлення #${num}*\n\n`;
  msg += `🛍️ ${o.product.name}\n`;
  msg += `📦 ${o.qty} шт × ${o.product.price} = *${total} грн*\n`;
  
  if (o.delivery === 'nova') {
    msg += `🚚 Нова Пошта: ${o.city}, відд. ${o.branch}\n`;
  } else {
    msg += `📮 Укрпошта: ${o.index}\n`;
  }
  
  if (o.payment === 'card') {
    msg += `💳 Оплата: картка\n\n`;
    msg += `💵 *${total} грн*\n`;
    msg += '`' + config.FOP_CARD_NUMBER + '`\n';
    msg += `${config.FOP_NAME}\n\n`;
    msg += `📎 Коментар: *Замовлення ${num}*`;
  } else {
    const cod = total + 20 + Math.round(total * 0.02) + 100;
    msg += `💰 Накладений платіж\n`;
    msg += `💵 *~${cod} грн* (на пошті)\n`;
    msg += `(+доставка +комісія)`;
  }
  
  msg += `\n\n👤 ${o.name}\n📞 +38${o.phone}`;
  
  ctx.replyWithMarkdown(msg);
  
  // Уведомление админу
  if (config.ADMIN_CHAT_ID) {
    ctx.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      `🔔 Замовлення #${num}\n${o.product.name} x${o.qty}\n💰 ${total} грн\n👤 ${o.name}`
    ).catch(() => {});
  }
  
  ctx.session.order = null;
}

console.log('🚀 Бот LOSSO запущений!');
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
