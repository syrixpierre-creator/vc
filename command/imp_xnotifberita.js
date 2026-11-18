/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for notifberita.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "notifberita.js",
  family: "B",
  command: "xnotifberita",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xnotifberita",
  aliases: [],
  category: "restored",
  description: "Restored: notifberita",
  usage: ".xnotifberita",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
