/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antiTag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antiTag.js",
  family: "B",
  command: "xantitag",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xantitag",
  aliases: [],
  category: "restored",
  description: "Restored: antiTag",
  usage: ".xantitag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
