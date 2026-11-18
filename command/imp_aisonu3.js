/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-sonu3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-sonu3.js",
  family: "A",
  command: "aisonu3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aisonu3",
  aliases: [],
  category: "restored",
  description: "Restored: ai-sonu3",
  usage: ".aisonu3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
