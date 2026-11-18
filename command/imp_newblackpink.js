/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_blackpink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_blackpink.js",
  family: "A",
  command: "newblackpink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newblackpink",
  aliases: [],
  category: "restored",
  description: "Restored: new_blackpink",
  usage: ".newblackpink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
