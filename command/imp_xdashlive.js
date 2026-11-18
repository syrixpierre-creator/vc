/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dashlive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dashlive.js",
  family: "B",
  command: "xdashlive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xdashlive",
  aliases: [],
  category: "restored",
  description: "Restored: dashlive",
  usage: ".xdashlive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
