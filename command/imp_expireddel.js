/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for expired-del.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "expired-del.js",
  family: "B",
  command: "expireddel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "expireddel",
  aliases: [],
  category: "restored",
  description: "Restored: expired-del",
  usage: ".expireddel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
