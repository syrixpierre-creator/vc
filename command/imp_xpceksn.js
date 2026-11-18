/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for xp-ceksn.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "xp-ceksn.js",
  family: "B",
  command: "xpceksn",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpceksn",
  aliases: [],
  category: "restored",
  description: "Restored: xp-ceksn",
  usage: ".xpceksn",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
