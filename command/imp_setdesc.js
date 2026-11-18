/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setdesc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setdesc.js",
  family: "A",
  command: "setdesc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setdesc",
  aliases: [],
  category: "restored",
  description: "Restored: setdesc",
  usage: ".setdesc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
