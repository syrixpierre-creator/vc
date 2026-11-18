/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-petimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-petimg.js",
  family: "B",
  command: "aipetimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aipetimg",
  aliases: [],
  category: "restored",
  description: "Restored: ai-petimg",
  usage: ".aipetimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
