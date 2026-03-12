#!/bin/bash
# Автопостинг садовых товаров в канал LOSSO
# Запускается через cron 3 раза в день

cd /root/.openclaw/workspace/Losso/bot

# Лог файл
LOG_FILE="./logs/autopost-cron.log"
mkdir -p ./logs

echo "=== $(date) ===" >> "$LOG_FILE"

# Запускаем скрипт и записываем результат
node autopost-garden.js >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Пост успешно опубликован" >> "$LOG_FILE"
else
    echo "❌ Ошибка при публикации (код: $EXIT_CODE)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"

exit $EXIT_CODE
