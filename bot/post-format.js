// TG UA формат — правильное экранирование для Telegram Markdown
function escapeTgMarkdown(text) {
  return text
    .replace(/([_\*\[\]()~`>#+=|{}.!\-])/g, '\\$1')
    .replace(/\n+/g, ' ')
    .trim();
}

// Генерация текста поста в формате /tg ua
function generatePostText(product) {
  // Краткое описание — чистим HTML и экранируем
  let shortDesc = '';
  if (product.description) {
    const sentences = product.description
      .replace(/<[^>]+>/g, '')
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 10);
    shortDesc = sentences.slice(0, 2).join('. ').substring(0, 200);
  }
  
  // Экранируем текст
  const name = escapeTgMarkdown(product.name);
  const desc = shortDesc ? escapeTgMarkdown(shortDesc) + '.' : '';
  
  // Эмодзи по категориям
  const categoryEmoji = {
    'сучкоріз': '🌳',
    'секатор': '✂️',
    'степлер': '📎',
    'ножиці': '✂️',
    'підв\'яз': '📎',
    'підвяз': '📎',
    'щеплен': '🔪',
    'ножівка': '🪚',
    'пила': '🪚',
    'лопат': '🥄',
    'грабел': '🍂',
    'шланг': '🚿'
  };
  
  let emoji = '🌿';
  for (const [key, em] of Object.entries(categoryEmoji)) {
    if (product.name.toLowerCase().includes(key)) {
      emoji = em;
      break;
    }
  }
  
  // Формат поста /tg ua
  const parts = [
    `${emoji} *${name}*`,
    '',
    desc,
    desc ? '' : null,
    `💰 *Ціна: ${product.price} грн*`,
    '',
    '👇 *Як замовити:*',
    'Натисніть кнопку нижче → бот надішле деталі в особисті повідомлення'
  ].filter(x => x !== null);
  
  return parts.join('\n');
}

module.exports = { generatePostText };
