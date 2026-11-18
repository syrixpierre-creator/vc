/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-setmenu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-setmenu.js",
  family: "B",
  command: "ownersetmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersetmenu",
  aliases: [],
  category: "restored",
  description: "Restored: owner-setmenu",
  usage: ".ownersetmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
