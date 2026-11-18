/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-image.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-image.js",
  family: "A",
  command: "toolsimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsimage",
  aliases: [],
  category: "restored",
  description: "Restored: tools-image",
  usage: ".toolsimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
