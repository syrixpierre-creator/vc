/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_litterbox.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_litterbox.js",
  family: "B",
  command: "newlitterbox",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newlitterbox",
  aliases: [],
  category: "restored",
  description: "Restored: new_litterbox",
  usage: ".newlitterbox",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
