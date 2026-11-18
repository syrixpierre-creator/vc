/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-translate.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-translate.js",
  family: "B",
  command: "tooltranslate",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tooltranslate",
  aliases: [],
  category: "restored",
  description: "Restored: tool-translate",
  usage: ".tooltranslate",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
