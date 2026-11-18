/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for left.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "left.js",
  family: "A",
  command: "xleft",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xleft",
  aliases: [],
  category: "restored",
  description: "Restored: left",
  usage: ".xleft",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
