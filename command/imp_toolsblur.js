/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-blur.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-blur.js",
  family: "B",
  command: "toolsblur",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsblur",
  aliases: [],
  category: "restored",
  description: "Restored: tools-blur",
  usage: ".toolsblur",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
