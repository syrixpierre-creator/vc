/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setname.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setname.js",
  family: "A",
  command: "setname",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setname",
  aliases: [],
  category: "restored",
  description: "Restored: setname",
  usage: ".setname",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
