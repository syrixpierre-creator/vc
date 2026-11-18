/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_setpackname.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_setpackname.js",
  family: "A",
  command: "newsetpackname",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsetpackname",
  aliases: [],
  category: "restored",
  description: "Restored: new_setpackname",
  usage: ".newsetpackname",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
