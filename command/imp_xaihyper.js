/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-hyper.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-hyper.js",
  family: "B",
  command: "xaihyper",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaihyper",
  aliases: [],
  category: "restored",
  description: "Restored: ai-hyper",
  usage: ".xaihyper",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
