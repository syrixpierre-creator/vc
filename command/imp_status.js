/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for status.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "status.js",
  family: "B",
  command: "status",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "status",
  aliases: [],
  category: "restored",
  description: "Restored: status",
  usage: ".status",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
