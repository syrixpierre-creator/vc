/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anti-mod.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anti-mod.js",
  family: "B",
  command: "antimod",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antimod",
  aliases: [],
  category: "restored",
  description: "Restored: anti-mod",
  usage: ".antimod",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
