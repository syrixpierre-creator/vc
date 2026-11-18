/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_delprefix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_delprefix.js",
  family: "A",
  command: "newdelprefix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdelprefix",
  aliases: [],
  category: "restored",
  description: "Restored: new_delprefix",
  usage: ".newdelprefix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
