/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dp.js",
  family: "B",
  command: "dp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dp",
  aliases: [],
  category: "restored",
  description: "Restored: dp",
  usage: ".dp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
