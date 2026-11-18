/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-bard.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-bard.js",
  family: "A",
  command: "aibard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aibard",
  aliases: [],
  category: "restored",
  description: "Restored: ai-bard",
  usage: ".aibard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
