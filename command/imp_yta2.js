/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for yta2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "yta2.js",
  family: "B",
  command: "yta2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "yta2",
  aliases: [],
  category: "restored",
  description: "Restored: yta2",
  usage: ".yta2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
