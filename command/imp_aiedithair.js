/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-edithair.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-edithair.js",
  family: "B",
  command: "aiedithair",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiedithair",
  aliases: [],
  category: "restored",
  description: "Restored: ai-edithair",
  usage: ".aiedithair",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
