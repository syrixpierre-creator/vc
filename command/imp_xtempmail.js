/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tempmail.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tempmail.js",
  family: "B",
  command: "xtempmail",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtempmail",
  aliases: [],
  category: "restored",
  description: "Restored: tempmail",
  usage: ".xtempmail",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
