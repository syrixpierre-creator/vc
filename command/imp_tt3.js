/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tt3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tt3.js",
  family: "B",
  command: "tt3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tt3",
  aliases: [],
  category: "restored",
  description: "Restored: tt3",
  usage: ".tt3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
