/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for religion.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "religion.js",
  family: "B",
  command: "religion",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "religion",
  aliases: [],
  category: "restored",
  description: "Restored: religion",
  usage: ".religion",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
