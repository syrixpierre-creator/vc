/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-pomf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-pomf.js",
  family: "B",
  command: "upomf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "upomf",
  aliases: [],
  category: "restored",
  description: "Restored: u-pomf",
  usage: ".upomf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
