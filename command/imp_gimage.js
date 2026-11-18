/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gimage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gimage.js",
  family: "A",
  command: "gimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gimage",
  aliases: [],
  category: "restored",
  description: "Restored: gimage",
  usage: ".gimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
