/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-dopple.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-dopple.js",
  family: "B",
  command: "aidopple",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aidopple",
  aliases: [],
  category: "restored",
  description: "Restored: ai-dopple",
  usage: ".aidopple",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
