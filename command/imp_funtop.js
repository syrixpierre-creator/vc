/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-top.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-top.js",
  family: "B",
  command: "funtop",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funtop",
  aliases: [],
  category: "restored",
  description: "Restored: fun-top",
  usage: ".funtop",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
