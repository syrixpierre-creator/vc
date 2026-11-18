/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for yta3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "yta3.js",
  family: "B",
  command: "yta3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "yta3",
  aliases: [],
  category: "restored",
  description: "Restored: yta3",
  usage: ".yta3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
