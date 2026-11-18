/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for listsewa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "listsewa.js",
  family: "B",
  command: "xlistsewa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xlistsewa",
  aliases: [],
  category: "restored",
  description: "Restored: listsewa",
  usage: ".xlistsewa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
