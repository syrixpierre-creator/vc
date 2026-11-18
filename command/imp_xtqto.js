/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tqto.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tqto.js",
  family: "B",
  command: "xtqto",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtqto",
  aliases: [],
  category: "restored",
  description: "Restored: tqto",
  usage: ".xtqto",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
