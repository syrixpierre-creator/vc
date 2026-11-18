/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ice.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ice.js",
  family: "B",
  command: "ice",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ice",
  aliases: [],
  category: "restored",
  description: "Restored: ice",
  usage: ".ice",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
