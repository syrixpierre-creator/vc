/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for kickme.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "kickme.js",
  family: "A",
  command: "xkickme",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xkickme",
  aliases: [],
  category: "restored",
  description: "Restored: kickme",
  usage: ".xkickme",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
