/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rch.js",
  family: "B",
  command: "rch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rch",
  aliases: [],
  category: "restored",
  description: "Restored: rch",
  usage: ".rch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
