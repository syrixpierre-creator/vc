/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_tmpfiles.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_tmpfiles.js",
  family: "B",
  command: "newtmpfiles",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newtmpfiles",
  aliases: [],
  category: "restored",
  description: "Restored: new_tmpfiles",
  usage: ".newtmpfiles",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
