const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Распознавание аудио через локальный Whisper
 * @param {string} audioPath - путь к аудио файлу
 * @param {Object} options - опции
 * @returns {Promise<Object>} - результат распознавания
 */
async function transcribeAudio(audioPath, options = {}) {
  const {
    model = 'base',      // tiny, base, small, medium, large
    language = 'uk',     // uk, ru, en
    outputDir = '/tmp/whisper-output'
  } = options;

  // Создаем директорию для вывода
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.basename(audioPath, path.extname(audioPath));
  const outputPath = path.join(outputDir, filename);

  try {
    // Конвертируем ogg (Telegram) в wav если нужно
    const wavPath = audioPath.endsWith('.ogg') 
      ? await convertOggToWav(audioPath, outputDir)
      : audioPath;

    // Запускаем whisper
    const cmd = `whisper "${wavPath}" --model ${model} --language ${language} --output_dir "${outputDir}" --output_format json`;
    
    console.log(`🎙️ Запуск Whisper: ${cmd}`);
    const { stdout, stderr } = await execPromise(cmd, { timeout: 120000 });
    
    // Читаем результат
    const jsonPath = `${wavPath.replace(path.extname(wavPath), '')}.json`;
    
    if (fs.existsSync(jsonPath)) {
      const result = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Очистка временных файлов
      cleanup([jsonPath, wavPath !== audioPath ? wavPath : null].filter(Boolean));
      
      return {
        success: true,
        text: result.text?.trim() || '',
        segments: result.segments || [],
        language: result.language,
        duration: result.duration
      };
    } else {
      throw new Error('Whisper не создал выходной файл');
    }
    
  } catch (error) {
    console.error('❌ Ошибка распознавания:', error.message);
    return {
      success: false,
      error: error.message,
      text: ''
    };
  }
}

/**
 * Конвертация OGG (Telegram voice) в WAV
 */
async function convertOggToWav(oggPath, outputDir) {
  const filename = path.basename(oggPath, '.ogg');
  const wavPath = path.join(outputDir, `${filename}.wav`);
  
  const cmd = `ffmpeg -i "${oggPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}" -y`;
  await execPromise(cmd, { timeout: 30000 });
  
  return wavPath;
}

/**
 * Очистка временных файлов
 */
function cleanup(files) {
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch (e) {
      // ignore
    }
  });
}

module.exports = { transcribeAudio };
