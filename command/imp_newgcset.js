/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_gcset.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_gcset.js",
  family: "A",
  command: "newgcset",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newgcset",
  aliases: [],
  category: "restored",
  description: "Restored: new_gcset",
  usage: ".newgcset",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
