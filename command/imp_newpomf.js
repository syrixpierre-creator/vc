/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_pomf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_pomf.js",
  family: "B",
  command: "newpomf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newpomf",
  aliases: [],
  category: "restored",
  description: "Restored: new_pomf",
  usage: ".newpomf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
