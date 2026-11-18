/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-prabowo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-prabowo.js",
  family: "A",
  command: "aiprabowo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiprabowo",
  aliases: [],
  category: "restored",
  description: "Restored: ai-prabowo",
  usage: ".aiprabowo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
