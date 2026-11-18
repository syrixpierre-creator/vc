/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-gpt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-gpt.js",
  family: "B",
  command: "aigpt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aigpt",
  aliases: [],
  category: "restored",
  description: "Restored: ai-gpt",
  usage: ".aigpt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
