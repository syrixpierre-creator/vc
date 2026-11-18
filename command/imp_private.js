/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for private.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "private.js",
  family: "B",
  command: "private",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "private",
  aliases: [],
  category: "restored",
  description: "Restored: private",
  usage: ".private",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
