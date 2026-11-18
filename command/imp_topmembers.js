/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for topmembers.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "topmembers.js",
  family: "B",
  command: "topmembers",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "topmembers",
  aliases: [],
  category: "restored",
  description: "Restored: topmembers",
  usage: ".topmembers",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
