/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for giftsticker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "giftsticker.js",
  family: "B",
  command: "giftsticker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "giftsticker",
  aliases: [],
  category: "restored",
  description: "Restored: giftsticker",
  usage: ".giftsticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
