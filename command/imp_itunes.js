/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for itunes.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "itunes.js",
  family: "A",
  command: "itunes",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "itunes",
  aliases: [],
  category: "restored",
  description: "Restored: itunes",
  usage: ".itunes",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
