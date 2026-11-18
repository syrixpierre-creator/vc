/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for metal.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "metal.js",
  family: "B",
  command: "metal",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "metal",
  aliases: [],
  category: "restored",
  description: "Restored: metal",
  usage: ".metal",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
