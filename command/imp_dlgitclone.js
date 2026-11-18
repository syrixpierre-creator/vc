/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-gitclone.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-gitclone.js",
  family: "B",
  command: "dlgitclone",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlgitclone",
  aliases: [],
  category: "restored",
  description: "Restored: dl-gitclone",
  usage: ".dlgitclone",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
