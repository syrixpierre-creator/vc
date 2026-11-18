/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_gayrate.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_gayrate.js",
  family: "B",
  command: "newgayrate",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newgayrate",
  aliases: [],
  category: "restored",
  description: "Restored: new_gayrate",
  usage: ".newgayrate",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
