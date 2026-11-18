/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quozio.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quozio.js",
  family: "A",
  command: "quozio",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quozio",
  aliases: [],
  category: "restored",
  description: "Restored: quozio",
  usage: ".quozio",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
