/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anicenseri.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anicenseri.js",
  family: "A",
  command: "anicenseri",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "anicenseri",
  aliases: [],
  category: "restored",
  description: "Restored: anicenseri",
  usage: ".anicenseri",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
