/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-nsfwcheck.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-nsfwcheck.js",
  family: "B",
  command: "ainsfwcheck",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ainsfwcheck",
  aliases: [],
  category: "restored",
  description: "Restored: ai-nsfwcheck",
  usage: ".ainsfwcheck",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
