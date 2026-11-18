/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-fb.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-fb.js",
  family: "B",
  command: "dlfb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlfb",
  aliases: [],
  category: "restored",
  description: "Restored: dl-fb",
  usage: ".dlfb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
