/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-gemini.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-gemini.js",
  family: "B",
  command: "aigemini",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aigemini",
  aliases: [],
  category: "restored",
  description: "Restored: ai-gemini",
  usage: ".aigemini",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
