module.exports = {
  apps: [{
    name: 'losso-shop-bot',
    script: './src/bot.js',
    cwd: '/root/.openclaw/workspace/Losso/bot',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true
  }]
};
