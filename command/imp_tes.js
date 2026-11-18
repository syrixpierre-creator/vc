/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tes.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tes.js",
  family: "B",
  command: "tes",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tes",
  aliases: [],
  category: "restored",
  description: "Restored: tes",
  usage: ".tes",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
