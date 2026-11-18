/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setauto-detectsvv.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setauto-detectsvv.js",
  family: "B",
  command: "setautodetectsvv",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setautodetectsvv",
  aliases: [],
  category: "restored",
  description: "Restored: setauto-detectsvv",
  usage: ".setautodetectsvv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
