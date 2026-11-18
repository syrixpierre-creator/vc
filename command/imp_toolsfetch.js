/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-fetch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-fetch.js",
  family: "B",
  command: "toolsfetch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsfetch",
  aliases: [],
  category: "restored",
  description: "Restored: tools-fetch",
  usage: ".toolsfetch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
