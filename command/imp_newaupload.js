/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_aupload.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_aupload.js",
  family: "B",
  command: "newaupload",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newaupload",
  aliases: [],
  category: "restored",
  description: "Restored: new_aupload",
  usage: ".newaupload",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
