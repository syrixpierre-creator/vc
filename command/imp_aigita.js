/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-gita.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-gita.js",
  family: "A",
  command: "aigita",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aigita",
  aliases: [],
  category: "restored",
  description: "Restored: ai-gita",
  usage: ".aigita",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
