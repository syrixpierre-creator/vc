/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for xp-levelup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "xp-levelup.js",
  family: "B",
  command: "xplevelup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xplevelup",
  aliases: [],
  category: "restored",
  description: "Restored: xp-levelup",
  usage: ".xplevelup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
