/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_momo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_momo.js",
  family: "B",
  command: "newmomo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newmomo",
  aliases: [],
  category: "restored",
  description: "Restored: new_momo",
  usage: ".newmomo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
