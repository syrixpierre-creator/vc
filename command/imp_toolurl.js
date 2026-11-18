/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-url.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-url.js",
  family: "B",
  command: "toolurl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolurl",
  aliases: [],
  category: "restored",
  description: "Restored: tool-url",
  usage: ".toolurl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
