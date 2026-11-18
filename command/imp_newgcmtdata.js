/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_gcmtdata.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_gcmtdata.js",
  family: "A",
  command: "newgcmtdata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newgcmtdata",
  aliases: [],
  category: "restored",
  description: "Restored: new_gcmtdata",
  usage: ".newgcmtdata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
