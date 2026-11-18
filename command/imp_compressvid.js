/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for compressvid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "compressvid.js",
  family: "A",
  command: "compressvid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "compressvid",
  aliases: [],
  category: "restored",
  description: "Restored: compressvid",
  usage: ".compressvid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
