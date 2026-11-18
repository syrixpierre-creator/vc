/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_smenu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_smenu.js",
  family: "A",
  command: "newsmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsmenu",
  aliases: [],
  category: "restored",
  description: "Restored: new_smenu",
  usage: ".newsmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
