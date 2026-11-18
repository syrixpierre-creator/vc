/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-unblur.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-unblur.js",
  family: "A",
  command: "toolsunblur",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsunblur",
  aliases: [],
  category: "restored",
  description: "Restored: tools-unblur",
  usage: ".toolsunblur",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
