/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _expired.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_expired.js",
  family: "B",
  command: "expired",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "expired",
  aliases: [],
  category: "restored",
  description: "Restored: _expired",
  usage: ".expired",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
