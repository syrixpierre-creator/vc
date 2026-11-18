/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-delete.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-delete.js",
  family: "B",
  command: "groupdelete",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupdelete",
  aliases: [],
  category: "restored",
  description: "Restored: group-delete",
  usage: ".groupdelete",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
