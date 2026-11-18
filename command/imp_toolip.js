/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-ip.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-ip.js",
  family: "B",
  command: "toolip",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolip",
  aliases: [],
  category: "restored",
  description: "Restored: tool-ip",
  usage: ".toolip",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
