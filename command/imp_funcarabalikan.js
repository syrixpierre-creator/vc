/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-carabalikan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-carabalikan.js",
  family: "A",
  command: "funcarabalikan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funcarabalikan",
  aliases: [],
  category: "restored",
  description: "Restored: fun-carabalikan",
  usage: ".funcarabalikan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
