/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for resize.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "resize.js",
  family: "A",
  command: "resize",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "resize",
  aliases: [],
  category: "restored",
  description: "Restored: resize",
  usage: ".resize",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
