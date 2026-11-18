/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for autosticker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "autosticker.js",
  family: "B",
  command: "xautosticker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xautosticker",
  aliases: [],
  category: "restored",
  description: "Restored: autosticker",
  usage: ".xautosticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
