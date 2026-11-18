/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for deleteprefix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "deleteprefix.js",
  family: "B",
  command: "deleteprefix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "deleteprefix",
  aliases: [],
  category: "restored",
  description: "Restored: deleteprefix",
  usage: ".deleteprefix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
