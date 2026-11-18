/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for url.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "url.js",
  family: "A",
  command: "xurl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xurl",
  aliases: [],
  category: "restored",
  description: "Restored: url",
  usage: ".xurl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
