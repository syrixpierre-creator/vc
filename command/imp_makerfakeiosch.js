/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakeiosch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakeiosch.js",
  family: "B",
  command: "makerfakeiosch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakeiosch",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakeiosch",
  usage: ".makerfakeiosch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
