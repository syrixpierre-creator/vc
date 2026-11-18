/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-script.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-script.js",
  family: "B",
  command: "infoscript",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infoscript",
  aliases: [],
  category: "restored",
  description: "Restored: info-script",
  usage: ".infoscript",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
