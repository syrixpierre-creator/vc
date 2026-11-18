/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setgcdp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setgcdp.js",
  family: "B",
  command: "setgcdp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setgcdp",
  aliases: [],
  category: "restored",
  description: "Restored: setgcdp",
  usage: ".setgcdp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
