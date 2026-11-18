/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for autotyping.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "autotyping.js",
  family: "B",
  command: "xautotyping",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xautotyping",
  aliases: [],
  category: "restored",
  description: "Restored: autotyping",
  usage: ".xautotyping",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
