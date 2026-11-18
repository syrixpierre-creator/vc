/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-addlimit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-addlimit.js",
  family: "B",
  command: "owneraddlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "owneraddlimit",
  aliases: [],
  category: "restored",
  description: "Restored: owner-addlimit",
  usage: ".owneraddlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
