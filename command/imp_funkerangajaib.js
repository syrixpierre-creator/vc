/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-kerangajaib.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-kerangajaib.js",
  family: "B",
  command: "funkerangajaib",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funkerangajaib",
  aliases: [],
  category: "restored",
  description: "Restored: fun-kerangajaib",
  usage: ".funkerangajaib",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
