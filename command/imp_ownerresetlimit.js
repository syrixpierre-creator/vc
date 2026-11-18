/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-resetlimit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-resetlimit.js",
  family: "B",
  command: "ownerresetlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerresetlimit",
  aliases: [],
  category: "restored",
  description: "Restored: owner-resetlimit",
  usage: ".ownerresetlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
