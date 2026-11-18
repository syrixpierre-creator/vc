/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-pindl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-pindl.js",
  family: "A",
  command: "downpindl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downpindl",
  aliases: [],
  category: "restored",
  description: "Restored: down-pindl",
  usage: ".downpindl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
