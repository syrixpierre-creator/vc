/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setbotimage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setbotimage.js",
  family: "A",
  command: "xsetbotimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xsetbotimage",
  aliases: [],
  category: "restored",
  description: "Restored: setbotimage",
  usage: ".xsetbotimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
