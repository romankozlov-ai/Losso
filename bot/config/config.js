// Конфигурация бота LOSSO
module.exports = {
  // Telegram
  BOT_TOKEN: '8768892836:AAGyV8J-0PgbKpd7jT8spy7783b08J15O_E',
  CHANNEL_ID: '@losso_shop',
  ADMIN_CHAT_ID: '1177549829',
  
  // Оплата
  FOP_CARD_NUMBER: '4246001030247229',
  FOP_NAME: 'Мандрика Тетяна',
  
  // Доставка - Новая Почта
  NOVA_POSHTA: {
    BIG_CITIES: { min: 85, max: 90, label: 'великі міста' },
    DISTRICT_CENTERS: { min: 105, max: 115, label: 'районні центри' },
    COD_FEE: 20, // комиссия за наложенный
    COD_PERCENT: 2, // процент за наложенный
  },
  
  // Доставка - Укрпошта
  UKR_POSHTA: {
    COST: { min: 50, max: 70, label: 'при отриманні' }
  },
  
  // Режим работы (пока заглушки - нужно уточнить)
  WORK_HOURS: {
    MONDAY_FRIDAY: { start: '09:00', end: '18:00' },
    SATURDAY: { start: '10:00', end: '17:00' },
    SUNDAY: { start: null, end: null },
    SHIPPING_DEADLINE: '15:00' // до этого времени - отправка сегодня
  },
  
  // Сообщения бота
  MESSAGES: {
    WELCOME: 'Вітаємо у магазині LOSSO! 🏠\n\nОберіть кількість товару:',
    WORK_HOURS: '⏰ Графік роботи: Пн-Пт 09:00-18:00, Сб 10:00-17:00',
    SHIPPING_TODAY: 'Ваше замовлення буде відправлено сьогодні до 17:00 📦',
    SHIPPING_TOMORROW: 'Ваше замовлення буде відправлено завтра 📦',
    STOCK_AVAILABLE: '✅ Товар в наявності: залишилося {count} шт.',
    STOCK_EMPTY: '⚠️ На жаль, цей товар закінчився',
    RESERVED: '🔒 Товар зарезервовано для вас на 15 хвилин',
  },
  
  // API SalesDrive (пока пусто - ждём ключ)
  SALESDRIVE: {
    API_KEY: null,
    BASE_URL: null
  }
};
