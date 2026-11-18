/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gemini.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gemini.js",
  family: "B",
  command: "gemini",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gemini",
  aliases: [],
  category: "restored",
  description: "Restored: gemini",
  usage: ".gemini",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
