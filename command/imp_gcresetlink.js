/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-resetlink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-resetlink.js",
  family: "B",
  command: "gcresetlink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcresetlink",
  aliases: [],
  category: "restored",
  description: "Restored: gc-resetlink",
  usage: ".gcresetlink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
