/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for auto-kick.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "auto-kick.js",
  family: "B",
  command: "autokick",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "autokick",
  aliases: [],
  category: "restored",
  description: "Restored: auto-kick",
  usage: ".autokick",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
