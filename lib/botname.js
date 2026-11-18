// QUEEN AKUMA bot name helper (used by ported plugins)
module.exports = {
  getBotName() {
    return process.env.BOT_NAME || (global.config && global.config.botName) || 'QUEEN AKUMA';
  }
};
