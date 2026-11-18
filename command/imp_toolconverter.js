/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-converter.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-converter.js",
  family: "B",
  command: "toolconverter",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolconverter",
  aliases: [],
  category: "restored",
  description: "Restored: tool-converter",
  usage: ".toolconverter",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
