/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for lock.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "lock.js",
  family: "A",
  command: "lock",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "lock",
  aliases: [],
  category: "restored",
  description: "Restored: lock",
  usage: ".lock",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
