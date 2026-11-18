/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for open.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "open.js",
  family: "B",
  command: "xopen",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xopen",
  aliases: [],
  category: "restored",
  description: "Restored: open",
  usage: ".xopen",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
