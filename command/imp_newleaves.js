/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_leaves.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_leaves.js",
  family: "A",
  command: "newleaves",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newleaves",
  aliases: [],
  category: "restored",
  description: "Restored: new_leaves",
  usage: ".newleaves",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
