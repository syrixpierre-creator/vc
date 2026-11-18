/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_xoat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_xoat.js",
  family: "B",
  command: "newxoat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newxoat",
  aliases: [],
  category: "restored",
  description: "Restored: new_xoat",
  usage: ".newxoat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
