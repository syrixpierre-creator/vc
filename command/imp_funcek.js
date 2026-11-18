/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for funcek.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "funcek.js",
  family: "A",
  command: "funcek",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funcek",
  aliases: [],
  category: "restored",
  description: "Restored: funcek",
  usage: ".funcek",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
