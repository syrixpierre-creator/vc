/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-colorify.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-colorify.js",
  family: "A",
  command: "aicolorify",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aicolorify",
  aliases: [],
  category: "restored",
  description: "Restored: ai-colorify",
  usage: ".aicolorify",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
