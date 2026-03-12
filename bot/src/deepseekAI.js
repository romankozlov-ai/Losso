// AI інтеграція: Kimi (основна) + DeepSeek fallback + Gemini fallback + локальна база
const axios = require('axios');

// API конфігурація
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Контекст для бота магазина LOSSO
const SYSTEM_PROMPT = `Ти — AI помічник магазину LOSSO (losso.com.ua).

ТОВАРИ:

СТЕПЛЕРИ ТАПЕНЕР (підв'язка винограду, дерев, кущів):
- SC-8102 (зелений) — стартова модель, базовий механізм підхоплення стрічки
- SC-8105 (помаранчевий) — вдосконалений механізм, ~650 грн
- SC-8107 (червоний) — вдосконалений механізм (аналогічний 8105)
- SC-8108 (2023 рік) — сучасний дизайн, полегшена вага, краща ергономічність, металевий стрижень у кейсі для стрічки

ВСІ моделі 8102/8105/8107/8108 мають ОДНАКОВУ надійність і сумісні з нашою стрічкою та скобами.

ГОДИННИКИ:
- LOSSO Premium LN-30 "LIGHT NIGHT" — висока чутливість датчика, підсвічування до 50 сек
- Годинник LED CW-30 — менша чутливість датчика, підсвічування 10 сек
Обидва: LED, будильник, термометр, USB/батарейки, ~395 грн

ГІЛКОРІЗ:
- Великі гілки (товсті) різати ТІЛЬКИ у складеному стані — це загальна норма
- У розкладеному стані леза не відкриються на максимум, важіль ручок занадто великий — ризик вигинання трубок
- Нерозкладений: гілки 40-50 мм (залежно від вологості та породи дерева)

ДОСТАВКА:
- Нова Пошта — 1-3 дні (від 60 грн)
- Укрпошта — 3-7 днів
- Відправка: Пн-Пт до 15:00, Сб до 12:00

ОПЛАТА:
- На картку: 4246001030247229 (ФОП Мандрика Т.С.)
- Накладений платіж (+ комісія 20₴ + 2%)

КОНТАКТИ:
- Тел: (098) 040 25 00, (050) 040 25 00, (093) 040 25 00
- Email: lossotrade@gmail.com
- Графік: Пн-Пт 9:00-18:00, Сб 10:00-17:00

ПРАВИЛА:
- Відповідай українською мовою
- Коротко та по суті (максимум 400 слів)
- Якщо не знаєш точну інформацію — скажи "Уточніть у менеджера"`;

// ========== KIMI (основна модель) ==========
async function askKimi(userQuestion, chatHistory = []) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-4), // останні 2 пари повідомлень
      { role: 'user', content: userQuestion }
    ];

    const response = await axios.post(
      'https://api.openclaw.ai/v1/chat/completions',
      {
        model: 'kimi-coding/k2p5',
        messages: messages,
        temperature: 0.7,
        max_tokens: 512,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд
      }
    );

    if (response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    }
    
    return null;
  } catch (error) {
    console.error('[Kimi Error]:', error.message);
    return null;
  }
}

// ========== DEEPSEEK (fallback) ==========
async function askDeepSeek(userQuestion, chatHistory = []) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-4),
      { role: 'user', content: userQuestion }
    ];

    const response = await axios.post(
      `${NVIDIA_BASE_URL}/chat/completions`,
      {
        model: 'deepseek-ai/deepseek-v3.2',
        messages: messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 512,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 секунд
      }
    );

    if (response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    }
    
    return null;
  } catch (error) {
    console.error('[DeepSeek Error]:', error.message);
    return null;
  }
}

// ========== GEMINI (fallback #2) ==========
async function askGemini(userQuestion, chatHistory = []) {
  if (!GEMINI_API_KEY) {
    console.log('[Gemini] Ключ не налаштовано');
    return null;
  }
  
  try {
    // Конвертуємо історію в формат Gemini
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Зрозуміло. Готовий допомагати клієнтам магазину LOSSO.' }] }
    ];
    
    // Додаємо історію чату
    chatHistory.slice(-4).forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });
    
    // Додаємо поточне питання
    contents.push({
      role: 'user',
      parts: [{ text: userQuestion }]
    });

    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          topP: 0.95
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (response.data.candidates && response.data.candidates[0]?.content?.parts[0]) {
      return response.data.candidates[0].content.parts[0].text;
    }
    
    return null;
  } catch (error) {
    console.error('[Gemini Error]:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

// ========== ЛОКАЛЬНА БАЗА (швидкий fallback) ==========
function getLocalAnswer(question) {
  const q = question.toLowerCase();
  
  // ===== СТЕПЛЕРИ =====
  if (q.includes('степлер') || q.includes('підв\'язка') || q.includes('виноград') || q.includes('тапенер')) {
    // Різниця між моделями
    if (q.includes('8102') || q.includes('зелений')) {
      return `📍 **Степлер SC-8102 (зелений)**

✅ Стартова модель виробника
✅ Базовий механізм підхоплення стрічки
✅ ОДНАКОВА надійність з 8105/8107/8108
✅ Сумісний з нашою стрічкою та скобами

💡 Різниця з 8105/8107 — трохи простіший механізм, але працює стабільно
💰 Уточнюйте ціну у менеджера`;
    }
    
    if (q.includes('8105') || q.includes('помаранчевий') || q.includes('оранжевий')) {
      return `📍 **Степлер SC-8105 (помаранчевий)**

✅ Вдосконалений механізм підхоплення стрічки
✅ ОДНАКОВА надійність з 8102/8107
✅ Сумісний з нашою стрічкою та скобами
✅ Швидкість: в 5-10 разів швидше за ручну
✅ Не пошкоджує стебла рослин

💰 **Ціна: ~650 грн**`;
    }
    
    if (q.includes('8107') || q.includes('червоний')) {
      return `📍 **Степлер SC-8107 (червоний)**

✅ Вдосконалений механізм (аналогічний 8105)
✅ ОДНАКОВА надійність з 8102/8105/8108
✅ Сумісний з нашою стрічкою та скобами
✅ Швидкість: в 5-10 разів швидше за ручну

💰 Уточнюйте ціну у менеджера`;
    }
    
    if (q.includes('8108') || q.includes('2023')) {
      return `📍 **Степлер SC-8108 (2023 рік)**

✅ Сучасний дизайн
✅ ПОЛЕГШЕНА вага (легший за попередні моделі)
✅ КРАЩА ергономічність — зручніше у роботі
✅ Кейс для стрічки з МЕТАЛЕВИМ стрижнем — довший ресурс
✅ ОДНАКОВА надійність з 8102/8105/8107
✅ Сумісний з нашою стрічкою та скобами

💰 Уточнюйте ціну у менеджера`;
    }
    
    // Різниця між моделями
    if (q.includes('різниця') || q.includes('відмінність') || q.includes('чим відрізняється') || q.includes('який краще') || q.includes('який вибрати')) {
      return `🔧 **Різниця між моделями степлерів:**

**SC-8102 (зелений)** — стартова модель, базовий механізм

**SC-8105 (помаранчевий)** та **SC-8107 (червоний)** — вдосконалений механізм (однаковий)

**SC-8108 (2023)** — найсучасніший:
• Полегшена вага
• Краща ергономічність
• Металевий стрижень у кейсі

✅ ВСІ моделі мають ОДНАКОВУ надійність і сумісні з нашою стрічкою/скобами

💡 **Який вибрати:**
• Економія → 8102
• Золота середина → 8105/8107  
• Максимальний комфорт → 8108`;
    }
    
    // Стрічка та скоби
    if (q.includes('стрічка') || q.includes('скоба') || q.includes('витратник')) {
      return `📍 **Стрічка та скоби для степлерів**

✅ Наша стрічка та скоби ПІДХОДЯТЬ до ВСІХ моделей:
• SC-8102, SC-8105, SC-8107, SC-8108

⚠️ **Важливо:** скоби та стрічка бувають різної якості! Звертайте увагу при виборі.

💡 **Порада:** якщо скоба застрягла — перевірте віконце виходу. Після нетривалої практики з'являється розуміння, яка сила натискання потрібна.`;
    }
    
    // Проблеми зі степлером
    if (q.includes('застряг') || q.includes('не працює') || q.includes('поломка') || q.includes('поламався') || q.includes('не скріплює')) {
      return `🔧 **Проблеми зі степлером**

**Якщо не виходить скріпити стрічку:**
1. Перевірте, чи не застрягла скоба у віконці її виходу
2. Переконайтесь, що стрічка правильно вставлена

**Практична порада:**
Після нетривалої роботи з'являється розуміння, яка сила натискання потрібна:
• При підхопленні стрічки
• При її відрізанні

Це практично виключає застрягання скоби в механізмі.

❓ Якщо проблема не вирішується — зверніться до менеджера`;
    }
    
    // Загальна інфо про степлери
    return `📍 **Степлери Тапенер LOSSO**

**Моделі:**
• SC-8102 (зелений) — стартова
• SC-8105 (помаранчевий) — вдосконалений
• SC-8107 (червоний) — вдосконалений
• SC-8108 (2023) — полегшений, ергономічний

✅ Призначення: підв'язка винограду, дерев, кущів
✅ Швидкість: в 5-10 разів швидше за ручну
✅ Не пошкоджує стебла рослин
✅ ВСІ моделі сумісні з нашою стрічкою та скобами

❓ Питання по конкретній моделі — пишіть назву (8102, 8105, 8107, 8108)`;
  }
  
  // ===== ГІЛКОРІЗ =====
  if (q.includes('гілкоріз') || q.includes('сучкоріз') || q.includes('обрізка') || q.includes('гілки')) {
    if (q.includes('товсті') || q.includes('великі') || q.includes('розкладений') || q.includes('складений') || q.includes('як різати')) {
      return `🔧 **Як правильно різати гілки гілкорізом**

**ВАЖЛИВО:** Великі (товсті) гілки — ТІЛЬКИ у складеному стані!

**Чому:**
• У розкладеному стані леза не відкриються на максимум (не вистачає ширини рук)
• Важіль ручок занадто великий → ризик вигинання трубок
• Небезпечно різати товсті гілки на висоті

**Нерозкладений секатор:**
• Гілки 40-50 мм — спокійно
• Враховуйте вологість та породу дерева

💡 Це загальна норма для ВСІХ моделей гілкорізів, не конкретної`;
    }
    
    return `📍 **Гілкоріз (сучкоріз)**

✅ Для обрізки гілок на висоті
✅ Телескопічна конструкція

**Важливо:**
• Товсті гілки — тільки у складеному стані
• У розкладеному — тонкі гілки (ризик вигинання)
• Гілки 40-50 мм — нерозкладений

💰 Уточнюйте ціну та наявність у менеджера`;
  }
  
  // ===== ГОДИННИКИ =====
  if (q.includes('годинник') || q.includes('будильник') || q.includes('час') || q.includes('температура') || q.includes('підсвітка')) {
    // Різниця між годинниками
    if (q.includes('різниця') || q.includes('відмінність') || q.includes('чим відрізняється') || q.includes('який краще') || q.includes('ln-30') || q.includes('cw-30') || q.includes('light night')) {
      return `🕐 **Різниця між годинниками LOSSO**

**LOSSO Premium LN-30 "LIGHT NIGHT":**
• ВИСОКА чутливість датчика вмикання
• Підсвічування до 50 секунд
• Реагує на слабкий звук

**Годинник LED CW-30:**
• МЕНША чутливість датчика
• Підсвічування 10 секунд
• Потрібен гучніший звук

**Спільне:**
✅ LED підсвічування (2 рівні яскравості)
✅ Будильник зі snooze
✅ Термометр
✅ Формати: 12/24 години
✅ Живлення: USB або 3xAAA

💡 **Який вибрати:**
• Тривала підсвітка + чутливість → LN-30
• Коротша підсвітка, менше реагує на звуки → CW-30`;
    }
    
    return `🕐 **Годинники LOSSO**

**Моделі:**
• LN-30 "LIGHT NIGHT" — підсвітка 50 сек, висока чутливість
• CW-30 — підсвітка 10 сек, менша чутливість

**Характеристики:**
✅ LED підсвічування (2 рівні яскравості)
✅ Будильник з функцією повтору (snooze)
✅ Термометр (показує температуру)
✅ Формати: 12/24 години
✅ Живлення: USB або 3xAAA батарейки
✅ Кольори: білий, чорний

💰 **Ціна: ~395 грн**

❓ Різниця між моделями — питайте!`;
  }
  
  // ===== ДОСТАВКА =====
  if (q.includes('доставка') || q.includes('нова пошта') || q.includes('укрпошта') || q.includes('коли прийде') || q.includes('терміни')) {
    return `🚚 **Доставка:**

• **Нова Пошта** — 1-3 дні (від 60 грн)
• **Укрпошта** — 3-7 днів

📦 **Відправка:**
• Пн-Пт: замовлення до 15:00 — відправка сьогодні
• Сб: замовлення до 12:00 — відправка сьогодні
• Нд: вихідний`;
  }
  
  // ===== ОПЛАТА =====
  if (q.includes('оплата') || q.includes('картка') || q.includes('оплатити') || q.includes('накладений') || q.includes('готівка')) {
    return `💳 **Способи оплати:**

1️⃣ **На картку** (повна передоплата)
   Картка: \`4246001030247229\`
   ФОП Мандрика Т.С.

2️⃣ **Накладений платіж**
   Оплата при отриманні
   + комісія Нової Пошти 20₴ + 2%

📱 Після оплати надішліть скріншот`;
  }
  
  // ===== ГАРАНТІЯ =====
  if (q.includes('гарантія') || q.includes('повернення') || q.includes('обмін') || q.includes('брак')) {
    return `🛡️ **Гарантія та повернення:**

✅ Гарантія: 6-12 місяців (залежно від товару)
✅ Обмін/повернення: протягом 14 днів
✅ Заводський брак — заміна за наш рахунок

⚠️ Увага: зняття захисної плівки з годинника = втрата товарного вигляду`;
  }
  
  // ===== КОНТАКТИ =====
  if (q.includes('контакт') || q.includes('телефон') || q.includes('менеджер') || q.includes('зв\'язатися') || q.includes('написати') || q.includes('дзвонити')) {
    return `📞 **Контакти:**

☎️ (098) 040 25 00
☎️ (050) 040 25 00
☎️ (093) 040 25 00

📧 Email: lossotrade@gmail.com

⏰ Графік роботи:
Пн-Пт: 9:00-18:00
Сб-Нд: 10:00-15:00
Нд: вихідний`;
  }
  
  return null;
}

// ========== ГОЛОВНА ФУНКЦІЯ ==========
// 1. Kimi (основна)
// 2. DeepSeek (fallback)
// 3. Gemini (fallback #2)
// 4. Локальна база (швидкий fallback)
async function getAIResponse(question, chatHistory = []) {
  console.log('[AI] Запит:', question.substring(0, 50) + '...');
  
  // Спроба 1: Kimi (основна модель)
  console.log('[AI] Спроба Kimi...');
  const kimiAnswer = await askKimi(question, chatHistory);
  
  if (kimiAnswer) {
    console.log('[AI] ✓ Відповідь від Kimi');
    return {
      source: 'kimi',
      answer: kimiAnswer
    };
  }
  
  // Спроба 2: DeepSeek (fallback)
  console.log('[AI] Спроба DeepSeek...');
  const deepSeekAnswer = await askDeepSeek(question, chatHistory);
  
  if (deepSeekAnswer) {
    console.log('[AI] ✓ Відповідь від DeepSeek');
    return {
      source: 'deepseek',
      answer: deepSeekAnswer
    };
  }
  
  // Спроба 3: Gemini (fallback #2)
  console.log('[AI] Спроба Gemini...');
  const geminiAnswer = await askGemini(question, chatHistory);
  
  if (geminiAnswer) {
    console.log('[AI] ✓ Відповідь від Gemini');
    return {
      source: 'gemini',
      answer: geminiAnswer
    };
  }
  
  // Спроба 4: Локальна база (миттєво)
  console.log('[AI] Локальна база...');
  const localAnswer = getLocalAnswer(question);
  
  if (localAnswer) {
    console.log('[AI] ✓ Відповідь з локальної бази');
    return {
      source: 'local',
      answer: localAnswer + '\n\n_Детальніше — у менеджера_ 👨‍💼'
    };
  }
  
  // Нічого не знайшли
  console.log('[AI] ✗ Немає відповіді');
  return {
    source: 'none',
    answer: '🤔 На жаль, я не знайшов відповіді на це питання.\n\n' +
            '👨‍💼 Зв\'яжіться з менеджером:\n' +
            '📞 (098) 040 25 00\n' +
            '📞 (050) 040 25 00'
  };
}

module.exports = { getAIResponse, askKimi, askDeepSeek, askGemini, getLocalAnswer };