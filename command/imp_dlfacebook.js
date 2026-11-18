/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl_facebook.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl_facebook.js",
  family: "B",
  command: "dlfacebook",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlfacebook",
  aliases: [],
  category: "restored",
  description: "Restored: dl_facebook",
  usage: ".dlfacebook",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
