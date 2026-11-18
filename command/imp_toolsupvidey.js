/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-upvidey.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-upvidey.js",
  family: "B",
  command: "toolsupvidey",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsupvidey",
  aliases: [],
  category: "restored",
  description: "Restored: tools-upvidey",
  usage: ".toolsupvidey",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
