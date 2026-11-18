/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for unshort.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "unshort.js",
  family: "A",
  command: "unshort",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "unshort",
  aliases: [],
  category: "restored",
  description: "Restored: unshort",
  usage: ".unshort",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
