/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setbirthday.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setbirthday.js",
  family: "A",
  command: "xsetbirthday",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xsetbirthday",
  aliases: [],
  category: "restored",
  description: "Restored: setbirthday",
  usage: ".xsetbirthday",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
