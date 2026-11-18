/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for autoreply.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "autoreply.js",
  family: "A",
  command: "xautoreply",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xautoreply",
  aliases: [],
  category: "restored",
  description: "Restored: autoreply",
  usage: ".xautoreply",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
