/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-nijika.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-nijika.js",
  family: "B",
  command: "ainijika",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ainijika",
  aliases: [],
  category: "restored",
  description: "Restored: ai-nijika",
  usage: ".ainijika",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
