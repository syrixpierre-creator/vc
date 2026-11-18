/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fontsearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fontsearch.js",
  family: "B",
  command: "xfontsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xfontsearch",
  aliases: [],
  category: "restored",
  description: "Restored: fontsearch",
  usage: ".xfontsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
