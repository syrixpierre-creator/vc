/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-enable.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-enable.js",
  family: "B",
  command: "mainenable",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainenable",
  aliases: [],
  category: "restored",
  description: "Restored: main-enable",
  usage: ".mainenable",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
