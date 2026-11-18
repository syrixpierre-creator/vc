/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-readmore.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-readmore.js",
  family: "A",
  command: "toolreadmore",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolreadmore",
  aliases: [],
  category: "restored",
  description: "Restored: tool-readmore",
  usage: ".toolreadmore",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
