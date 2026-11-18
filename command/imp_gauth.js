/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gauth.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gauth.js",
  family: "B",
  command: "gauth",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gauth",
  aliases: [],
  category: "restored",
  description: "Restored: gauth",
  usage: ".gauth",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
