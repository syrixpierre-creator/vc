/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-uppastebin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-uppastebin.js",
  family: "B",
  command: "tooluppastebin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tooluppastebin",
  aliases: [],
  category: "restored",
  description: "Restored: tool-uppastebin",
  usage: ".tooluppastebin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
