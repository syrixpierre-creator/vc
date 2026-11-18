/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gcadd.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gcadd.js",
  family: "A",
  command: "xgcadd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgcadd",
  aliases: [],
  category: "restored",
  description: "Restored: gcadd",
  usage: ".xgcadd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
