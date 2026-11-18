/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for waifuhtm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "waifuhtm.js",
  family: "A",
  command: "xwaifuhtm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xwaifuhtm",
  aliases: [],
  category: "restored",
  description: "Restored: waifuhtm",
  usage: ".xwaifuhtm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
