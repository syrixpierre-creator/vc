/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-limit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-limit.js",
  family: "B",
  command: "mainlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainlimit",
  aliases: [],
  category: "restored",
  description: "Restored: main-limit",
  usage: ".mainlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
