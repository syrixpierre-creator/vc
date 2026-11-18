/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for playncs.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "playncs.js",
  family: "A",
  command: "xplayncs",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xplayncs",
  aliases: [],
  category: "restored",
  description: "Restored: playncs",
  usage: ".xplayncs",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
