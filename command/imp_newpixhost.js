/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_pixhost.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_pixhost.js",
  family: "B",
  command: "newpixhost",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newpixhost",
  aliases: [],
  category: "restored",
  description: "Restored: new_pixhost",
  usage: ".newpixhost",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
