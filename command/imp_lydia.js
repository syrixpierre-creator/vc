/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for lydia.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "lydia.js",
  family: "B",
  command: "lydia",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "lydia",
  aliases: [],
  category: "restored",
  description: "Restored: lydia",
  usage: ".lydia",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
