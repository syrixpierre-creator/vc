/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for igsticker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "igsticker.js",
  family: "B",
  command: "igsticker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "igsticker",
  aliases: [],
  category: "restored",
  description: "Restored: igsticker",
  usage: ".igsticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
