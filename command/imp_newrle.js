/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_rle.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_rle.js",
  family: "B",
  command: "newrle",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newrle",
  aliases: [],
  category: "restored",
  description: "Restored: new_rle",
  usage: ".newrle",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
