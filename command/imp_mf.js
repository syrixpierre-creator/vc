/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for mf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "mf.js",
  family: "B",
  command: "mf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mf",
  aliases: [],
  category: "restored",
  description: "Restored: mf",
  usage: ".mf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
