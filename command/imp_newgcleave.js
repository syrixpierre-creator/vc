/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_gcleave.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_gcleave.js",
  family: "A",
  command: "newgcleave",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newgcleave",
  aliases: [],
  category: "restored",
  description: "Restored: new_gcleave",
  usage: ".newgcleave",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
