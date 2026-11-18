/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-newgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-newgc.js",
  family: "B",
  command: "groupnewgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupnewgc",
  aliases: [],
  category: "restored",
  description: "Restored: group-newgc",
  usage: ".groupnewgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
