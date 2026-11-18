/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antiBot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antiBot.js",
  family: "B",
  command: "xantibot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantibot",
  aliases: [],
  category: "restored",
  description: "Restored: antiBot",
  usage: ".xantibot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
