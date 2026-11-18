/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for styletext.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "styletext.js",
  family: "A",
  command: "styletext",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "styletext",
  aliases: [],
  category: "restored",
  description: "Restored: styletext",
  usage: ".styletext",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
