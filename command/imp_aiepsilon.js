/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-epsilon.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-epsilon.js",
  family: "A",
  command: "aiepsilon",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiepsilon",
  aliases: [],
  category: "restored",
  description: "Restored: ai-epsilon",
  usage: ".aiepsilon",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
