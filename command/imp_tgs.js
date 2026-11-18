/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tgs.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tgs.js",
  family: "B",
  command: "tgs",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tgs",
  aliases: [],
  category: "restored",
  description: "Restored: tgs",
  usage: ".tgs",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
