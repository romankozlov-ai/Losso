const config = require('../../config/config');

/**
 * Расчет стоимости заказа
 * @param {Object} order - данные заказа
 * @param {Object} product - данные товара
 * @returns {Object} - расчет стоимости
 */
function calculateOrderTotal(order, product) {
  const productTotal = order.quantity * product.price;
  
  // Доставка Новой Почтой - примерные значения
  const novaBigCity = 87; // среднее
  const novaDistrict = 110; // среднее
  const avgNovaShipping = Math.round((novaBigCity + novaDistrict) / 2);
  
  // Доставка Укрпочтой
  const ukrShipping = Math.round((config.UKR_POSHTA.COST.min + config.UKR_POSHTA.COST.max) / 2);
  
  if (order.delivery === 'nova') {
    if (order.payment === 'card') {
      // Полная оплата: только товар сейчас, доставка при получении
      return {
        productTotal,
        shippingCost: avgNovaShipping,
        codFee: 0,
        totalNow: productTotal,
        totalAtPickup: avgNovaShipping,
        codTotal: 0
      };
    } else {
      // Наложенный платеж: всё при получении
      const codFee = config.NOVA_POSHTA.COD_FEE + (productTotal * config.NOVA_POSHTA.COD_PERCENT / 100);
      const codTotal = productTotal + codFee + avgNovaShipping;
      
      return {
        productTotal,
        shippingCost: avgNovaShipping,
        codFee,
        totalNow: 0,
        totalAtPickup: codTotal,
        codTotal
      };
    }
  } else {
    // Укрпошта - только полная оплата
    return {
      productTotal,
      shippingCost: ukrShipping,
      codFee: 0,
      totalNow: productTotal,
      totalAtPickup: ukrShipping,
      codTotal: 0
    };
  }
}

/**
 * Форматирование суммы
 * @param {number} amount 
 * @returns {string}
 */
function formatAmount(amount) {
  return amount.toLocaleString('uk-UA') + ' грн';
}

/**
 * Расчет времени отправки
 * @returns {Object} - когда отправят
 */
function calculateShippingTime() {
  const now = new Date();
  const hour = now.getHours();
  const deadline = parseInt(config.WORK_HOURS.SHIPPING_DEADLINE);
  
  if (hour < deadline) {
    return {
      today: true,
      message: 'Ваше замовлення буде відправлено сьогодні до 15:00 📦'
    };
  } else {
    return {
      today: false,
      message: 'Ваше замовлення буде відправлено завтра 📦'
    };
  }
}

module.exports = {
  calculateOrderTotal,
  formatAmount,
  calculateShippingTime
};
