# 🤖 LOSSO Shop Bot

Telegram-бот для магазина LOSSO

## ⚡ Быстрый старт

```bash
npm install
npm start
```

## 📁 Структура

```
Losso/bot/
├── config/
│   └── config.js          # Конфигурация бота
├── src/
│   ├── bot.js             # Главный файл
│   ├── utils/
│   │   └── calculator.js  # Расчет стоимости
│   └── handlers/          # Обработчики (пока в bot.js)
└── package.json
```

## 🔧 Настройка

Все данные уже в `config/config.js`:
- BOT_TOKEN
- CHANNEL_ID
- FOP_CARD_NUMBER
- FOP_NAME
- ADMIN_CHAT_ID

## 🔄 Флоу заказа

1. Пользователь жмет "Купить" в канале
2. Выбор количества
3. Выбор доставки (НП / Укрпочта)
4. Выбор оплаты (для НП)
5. Ввод ПІБ, телефона, адреса
6. Подтверждение заказа
7. Оплата (если на карту) / Уведомление админу

## 📋 TODO

- [ ] Интеграция SalesDrive API
- [ ] Загрузка товаров из YML/CSV
- [ ] Проверка остатков
- [ ] Трек-номера
- [ ] Redis для хранения состояний

## 🚀 Деплой

```bash
# PM2
pm2 start src/bot.js --name losso-bot
```
