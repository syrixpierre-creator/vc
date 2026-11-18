/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-kita.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-kita.js",
  family: "B",
  command: "aikita",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aikita",
  aliases: [],
  category: "restored",
  description: "Restored: ai-kita",
  usage: ".aikita",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
