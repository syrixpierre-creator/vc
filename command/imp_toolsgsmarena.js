/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-gsmarena.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-gsmarena.js",
  family: "B",
  command: "toolsgsmarena",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsgsmarena",
  aliases: [],
  category: "restored",
  description: "Restored: tools-gsmarena",
  usage: ".toolsgsmarena",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
