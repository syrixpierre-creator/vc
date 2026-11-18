/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-sharetext.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-sharetext.js",
  family: "A",
  command: "toolssharetext",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolssharetext",
  aliases: [],
  category: "restored",
  description: "Restored: tools-sharetext",
  usage: ".toolssharetext",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
