/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl_instagram.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl_instagram.js",
  family: "B",
  command: "dlinstagram",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlinstagram",
  aliases: [],
  category: "restored",
  description: "Restored: dl_instagram",
  usage: ".dlinstagram",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
