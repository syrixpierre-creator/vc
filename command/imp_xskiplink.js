/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for skiplink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "skiplink.js",
  family: "A",
  command: "xskiplink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xskiplink",
  aliases: [],
  category: "restored",
  description: "Restored: skiplink",
  usage: ".xskiplink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
