module.exports = {
  apps: [{
    name: 'queen-akuma',
    script: 'manager.js',
    instances: 1,
    autorestart: true,
    watch: false,
    // chaque bot est un process enfant redémarré par le manager ; limite RAM par bot : BOT_MAX_RAM_MB
    env: { NODE_ENV: 'production' }
  }]
};
