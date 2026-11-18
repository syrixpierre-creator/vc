/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai_dalle.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai_dalle.js",
  family: "B",
  command: "aidalle",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aidalle",
  aliases: [],
  category: "restored",
  description: "Restored: ai_dalle",
  usage: ".aidalle",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
