/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-wanted.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-wanted.js",
  family: "B",
  command: "makerwanted",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerwanted",
  aliases: [],
  category: "restored",
  description: "Restored: maker-wanted",
  usage: ".makerwanted",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
