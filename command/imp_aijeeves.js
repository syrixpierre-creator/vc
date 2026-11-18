/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-jeeves.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-jeeves.js",
  family: "A",
  command: "aijeeves",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aijeeves",
  aliases: [],
  category: "restored",
  description: "Restored: ai-jeeves",
  usage: ".aijeeves",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
