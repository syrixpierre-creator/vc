/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakexnxx.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakexnxx.js",
  family: "A",
  command: "makerfakexnxx",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakexnxx",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakexnxx",
  usage: ".makerfakexnxx",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
