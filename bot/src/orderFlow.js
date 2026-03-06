// Order Flow Module
// Handles the complete order scenario

const { Markup } = require('telegraf');

// Delivery and payment configuration
const DELIVERY_CONFIG = {
  nova_poshta: {
    name: '🚚 Нова Пошта',
    price_big_city: 90,    // Київ, Харків, Одеса, Дніпро
    price_region: 110,     // Районні центри
    payment_options: ['card_full', 'cash_on_delivery']
  },
  ukrposhta: {
    name: '📮 Укрпошта',
    price: 60,             // Середня вартість
    payment_options: ['card_full']
  }
};

const PAYMENT_CONFIG = {
  card_full: {
    name: '💳 Повна оплата на картку ФОП',
    description: 'Оплачуєте тільки товар, доставку при отриманні'
  },
  cash_on_delivery: {
    name: '💰 Накладний платіж',
    description: 'Оплачуєте при отриманні: товар + комісія 20₴ + 2% + доставка',
    commission_fixed: 20,
    commission_percent: 0.02
  }
};

// State machine for order flow
const orderFlow = {
  
  // Step 1: Product selection (triggered from channel)
  async startOrder(ctx, productData) {
    const userId = ctx.from.id;
    
    // Save initial order data
    const orderData = {
      product_id: productData.id,
      product_name: productData.name,
      product_price: productData.price,
      quantity: 1
    };
    
    ctx.session.order = orderData;
    ctx.session.state = 'order_quantity';
    
    await ctx.reply(
      `🛍 <b>${productData.name}</b>\n` +
      `💰 Ціна: ${productData.price}₴\n\n` +
      `Оберіть кількість:`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('1', 'qty_1'),
            Markup.button.callback('2', 'qty_2'),
            Markup.button.callback('3', 'qty_3')
          ],
          [
            Markup.button.callback('4', 'qty_4'),
            Markup.button.callback('5', 'qty_5'),
            Markup.button.callback('Інша', 'qty_custom')
          ]
        ])
      }
    );
  },
  
  // Step 2: Handle quantity selection
  async handleQuantity(ctx, quantity) {
    ctx.session.order.quantity = parseInt(quantity);
    ctx.session.state = 'order_delivery';
    
    const productPrice = ctx.session.order.product_price;
    const totalProduct = productPrice * ctx.session.order.quantity;
    
    await ctx.reply(
      `✅ Кількість: ${quantity} шт.\n` +
      `💰 Вартість товару: ${totalProduct}₴\n\n` +
      `Оберіть спосіб доставки:`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🚚 Нова Пошта', 'delivery_nova_poshta')],
        [Markup.button.callback('📮 Укрпошта', 'delivery_ukrposhta')]
      ])
    );
  },
  
  // Step 3: Handle delivery method
  async handleDelivery(ctx, method) {
    ctx.session.order.delivery_method = method;
    ctx.session.state = 'order_payment';
    
    const config = DELIVERY_CONFIG[method];
    const options = config.payment_options;
    
    let keyboard = [];
    
    if (options.includes('card_full')) {
      keyboard.push([
        Markup.button.callback(
          PAYMENT_CONFIG.card_full.name,
          'payment_card_full'
        )
      ]);
    }
    
    if (options.includes('cash_on_delivery')) {
      keyboard.push([
        Markup.button.callback(
          PAYMENT_CONFIG.cash_on_delivery.name,
          'payment_cash_on_delivery'
        )
      ]);
    }
    
    let text = `🚚 Доставка: ${config.name}\n\n`;
    
    if (method === 'nova_poshta') {
      text += `Вартість доставки:\n`;
      text += `• Великі міста: ${config.price_big_city}₴\n`;
      text += `• Районні центри: ${config.price_region}₴\n\n`;
    } else {
      text += `Вартість доставки: ~${config.price}₴\n\n`;
    }
    
    text += `Оберіть спосіб оплати:`;
    
    await ctx.reply(text, Markup.inlineKeyboard(keyboard));
  },
  
  // Step 4: Handle payment method
  async handlePayment(ctx, method) {
    ctx.session.order.payment_method = method;
    ctx.session.state = 'order_name';
    
    const config = PAYMENT_CONFIG[method];
    
    await ctx.reply(
      `${config.name}\n` +
      `${config.description}\n\n` +
      `Введіть ваше ПІБ (повністю):`,
      { parse_mode: 'HTML' }
    );
  },
  
  // Step 5: Collect customer data
  async collectCustomerData(ctx, field, value, validators) {
    switch (field) {
      case 'name':
        const validName = validators.name(value);
        if (!validName) {
          await ctx.reply('⚠️ Введіть коректне ПІБ (тільки букви). Спробуйте ще раз:');
          return false;
        }
        ctx.session.order.customer_name = validName;
        ctx.session.state = 'order_phone';
        await ctx.reply('📱 Введіть номер телефону у форматі +380XXXXXXXXX:');
        return true;
        
      case 'phone':
        const validPhone = validators.phone(value);
        if (!validPhone) {
          await ctx.reply('⚠️ Невірний формат. Введіть +380XXXXXXXXX:');
          return false;
        }
        ctx.session.order.customer_phone = validPhone;
        ctx.session.state = 'order_city';
        await ctx.reply('🏙 Введіть місто доставки:');
        return true;
        
      case 'city':
        const validCity = validators.city(value);
        if (!validCity) {
          await ctx.reply('⚠️ Введіть коректну назву міста:');
          return false;
        }
        ctx.session.order.customer_city = validCity;
        ctx.session.state = 'order_branch';
        
        const deliveryMethod = ctx.session.order.delivery_method;
        if (deliveryMethod === 'nova_poshta') {
          await ctx.reply('📦 Введіть номер відділення Нової Пошти:');
        } else {
          await ctx.reply('📮 Введіть індекс відділення Укрпошти:');
        }
        return true;
        
      case 'branch':
        ctx.session.order.customer_branch = value.trim();
        ctx.session.state = 'order_confirm';
        await this.showConfirmation(ctx);
        return true;
    }
  },
  
  // Calculate total
  calculateTotal(order) {
    const productTotal = order.product_price * order.quantity;
    let deliveryCost = 0;
    let commission = 0;
    
    const delivery = DELIVERY_CONFIG[order.delivery_method];
    
    if (order.delivery_method === 'nova_poshta') {
      // Середнє значення для розрахунку
      deliveryCost = Math.round((delivery.price_big_city + delivery.price_region) / 2);
    } else {
      deliveryCost = delivery.price;
    }
    
    if (order.payment_method === 'cash_on_delivery') {
      commission = PAYMENT_CONFIG.cash_on_delivery.commission_fixed + 
                   (productTotal * PAYMENT_CONFIG.cash_on_delivery.commission_percent);
    }
    
    return {
      product: productTotal,
      delivery: deliveryCost,
      commission: Math.round(commission),
      total: productTotal + (order.payment_method === 'cash_on_delivery' ? deliveryCost + commission : 0)
    };
  },
  
  // Show order confirmation
  async showConfirmation(ctx) {
    const order = ctx.session.order;
    const calc = this.calculateTotal(order);
    
    let text = '📋 <b>Підтвердження замовлення:</b>\n\n';
    text += `🛍 Товар: ${order.product_name}\n`;
    text += `📦 Кількість: ${order.quantity} шт.\n`;
    text += `💰 Вартість товару: ${calc.product}₴\n\n`;
    
    text += `🚚 Доставка: ${DELIVERY_CONFIG[order.delivery_method].name}\n`;
    text += `📍 ${order.customer_city}, відд. ${order.customer_branch}\n`;
    text += `👤 ${order.customer_name}\n`;
    text += `📱 ${order.customer_phone}\n\n`;
    
    text += `💳 Оплата: ${PAYMENT_CONFIG[order.payment_method].name}\n\n`;
    
    if (order.payment_method === 'card_full') {
      text += `<b>До оплати зараз:</b> ${calc.product}₴ (тільки товар)\n`;
      text += `Доставку ${calc.delivery}₴ оплатите при отриманні\n\n`;
    } else {
      text += `<b>До оплати при отриманні:</b>\n`;
      text += `Товар: ${calc.product}₴\n`;
      text += `Доставка: ${calc.delivery}₴\n`;
      text += `Комісія: ${calc.commission}₴\n`;
      text += `<b>Разом: ${calc.total}₴</b>\n\n`;
    }
    
    await ctx.reply(
      text,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Підтвердити замовлення', 'order_confirm_yes')],
          [Markup.button.callback('❌ Скасувати', 'order_cancel')]
        ])
      }
    );
  },
  
  // Finalize order
  async finalizeOrder(ctx, db) {
    const order = ctx.session.order;
    const calc = this.calculateTotal(order);
    
    // Save to database
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (
          user_id, product_id, quantity, delivery_method, payment_method,
          customer_name, customer_phone, customer_city, customer_branch, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ctx.from.id,
          order.product_id,
          order.quantity,
          order.delivery_method,
          order.payment_method,
          order.customer_name,
          order.customer_phone,
          order.customer_city,
          order.customer_branch,
          calc.product
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }
};

module.exports = { orderFlow, DELIVERY_CONFIG, PAYMENT_CONFIG };
