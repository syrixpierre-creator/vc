/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-tourl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-tourl.js",
  family: "B",
  command: "toolstourl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolstourl",
  aliases: [],
  category: "restored",
  description: "Restored: tools-tourl",
  usage: ".toolstourl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
