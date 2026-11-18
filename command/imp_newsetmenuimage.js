/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_setmenuimage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_setmenuimage.js",
  family: "B",
  command: "newsetmenuimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsetmenuimage",
  aliases: [],
  category: "restored",
  description: "Restored: new_setmenuimage",
  usage: ".newsetmenuimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
