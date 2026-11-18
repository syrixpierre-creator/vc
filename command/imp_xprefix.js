/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for prefix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "prefix.js",
  family: "B",
  command: "xprefix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xprefix",
  aliases: [],
  category: "restored",
  description: "Restored: prefix",
  usage: ".xprefix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
