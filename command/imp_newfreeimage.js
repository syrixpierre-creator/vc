/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_freeimage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_freeimage.js",
  family: "A",
  command: "newfreeimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newfreeimage",
  aliases: [],
  category: "restored",
  description: "Restored: new_freeimage",
  usage: ".newfreeimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
