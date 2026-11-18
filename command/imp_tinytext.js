/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tinytext.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tinytext.js",
  family: "A",
  command: "tinytext",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tinytext",
  aliases: [],
  category: "restored",
  description: "Restored: tinytext",
  usage: ".tinytext",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
