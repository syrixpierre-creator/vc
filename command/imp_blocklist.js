/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for blocklist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "blocklist.js",
  family: "B",
  command: "blocklist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "blocklist",
  aliases: [],
  category: "restored",
  description: "Restored: blocklist",
  usage: ".blocklist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
