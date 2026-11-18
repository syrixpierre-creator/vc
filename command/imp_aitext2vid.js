/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-text2vid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-text2vid.js",
  family: "B",
  command: "aitext2vid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aitext2vid",
  aliases: [],
  category: "restored",
  description: "Restored: ai-text2vid",
  usage: ".aitext2vid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
