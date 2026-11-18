/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-quilbot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-quilbot.js",
  family: "A",
  command: "aiquilbot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiquilbot",
  aliases: [],
  category: "restored",
  description: "Restored: ai-quilbot",
  usage: ".aiquilbot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
