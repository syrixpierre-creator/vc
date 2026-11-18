/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for lahelu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "lahelu.js",
  family: "A",
  command: "xlahelu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xlahelu",
  aliases: [],
  category: "restored",
  description: "Restored: lahelu",
  usage: ".xlahelu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
