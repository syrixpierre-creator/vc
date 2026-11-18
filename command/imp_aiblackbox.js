/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-blackbox.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-blackbox.js",
  family: "B",
  command: "aiblackbox",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiblackbox",
  aliases: [],
  category: "restored",
  description: "Restored: ai-blackbox",
  usage: ".aiblackbox",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
