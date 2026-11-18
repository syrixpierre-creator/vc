/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_broadcastdm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_broadcastdm.js",
  family: "A",
  command: "newbroadcastdm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newbroadcastdm",
  aliases: [],
  category: "restored",
  description: "Restored: new_broadcastdm",
  usage: ".newbroadcastdm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
