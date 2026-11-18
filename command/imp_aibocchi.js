/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-bocchi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-bocchi.js",
  family: "B",
  command: "aibocchi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aibocchi",
  aliases: [],
  category: "restored",
  description: "Restored: ai-bocchi",
  usage: ".aibocchi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
