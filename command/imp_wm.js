/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for wm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "wm.js",
  family: "B",
  command: "wm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "wm",
  aliases: [],
  category: "restored",
  description: "Restored: wm",
  usage: ".wm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
